import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SoftRemoveEvent,
  DataSource,
  EntityManager,
} from 'typeorm';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';
import { UserContext } from '../../../../common/context/user.context';

/**
 * Lista de entidades a excluir de la auditoría.
 * Evita loops infinitos y registros innecesarios.
 */
const EXCLUDED_ENTITIES = ['AuditLog', 'migrations'];

/**
 * Campos a excluir de los valores auditados por seguridad o redundancia.
 */
const EXCLUDED_FIELDS = [
  'password',
  'passwordHash',
  'refreshToken',
  'accessToken',
];

/**
 * Subscriber de TypeORM para auditoría automática.
 *
 * Captura automáticamente todas las operaciones de INSERT, UPDATE, DELETE
 * y SOFT_DELETE en las entidades del sistema, registrando:
 * - Valores anteriores y nuevos
 * - Campos modificados
 * - Usuario que realizó la acción
 * - IP, User Agent y Session ID
 *
 * Utiliza AsyncLocalStorage para obtener el contexto del usuario
 * sin necesidad de pasarlo como parámetro.
 */
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  private shouldAudit(entityName: string): boolean {
    return !EXCLUDED_ENTITIES.includes(entityName);
  }

  private sanitizeValues(
    values: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!values) return values;

    const sanitized = { ...values };
    for (const field of EXCLUDED_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  /**
   * Obtiene los campos que cambiaron entre dos objetos.
   */
  private getChangedFields(
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): string[] {
    if (!oldValues || !newValues) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues),
    ]);

    for (const key of allKeys) {
      if (EXCLUDED_FIELDS.includes(key)) continue;

      const oldVal = JSON.stringify(oldValues[key]);
      const newVal = JSON.stringify(newValues[key]);

      if (oldVal !== newVal) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  /**
   * Crea el registro de auditoría usando una conexión separada
   * para evitar problemas con la transacción actual.
   */
  private async createAuditLog(
    manager: EntityManager,
    data: Partial<AuditLog>,
  ): Promise<void> {
    try {
      const context = UserContext.getCurrentContext();

      const auditLog = manager.create(AuditLog, {
        ...data,
        userId: context?.userId,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        sessionId: context?.sessionId,
      });

      await manager
        .createQueryBuilder()
        .insert()
        .into(AuditLog)
        .values(auditLog)
        .execute();
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Convierte una entidad a un objeto plano para auditoría.
   */
  private entityToObject(entity: unknown): Record<string, unknown> {
    if (!entity) return {};

    // Si ya es un objeto plano, retornarlo
    if (typeof entity !== 'object') return {};

    const result: Record<string, unknown> = {};
    const entityObj = entity as Record<string, unknown>;

    for (const key of Object.keys(entityObj)) {
      const value = entityObj[key];

      // Excluir funciones y relaciones complejas
      if (typeof value === 'function') continue;
      if (
        value &&
        typeof value === 'object' &&
        value.constructor?.name !== 'Object' &&
        value.constructor?.name !== 'Array' &&
        !(value instanceof Date)
      ) {
        // Es una relación o entidad anidada, guardamos solo el ID si existe
        if ((value as { id?: string }).id) {
          result[`${key}Id`] = (value as { id: string }).id;
        }
        continue;
      }

      result[key] = value;
    }

    return result;
  }

  /**
   * Hook para INSERT - después de insertar una entidad.
   */
  async afterInsert(event: InsertEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;

    const newValues = this.sanitizeValues(this.entityToObject(event.entity));

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId: (event.entity as { id?: string })?.id,
      action: AuditAction.INSERT,
      oldValues: undefined,
      newValues,
      changedFields: Object.keys(newValues).filter(
        (k) => !EXCLUDED_FIELDS.includes(k),
      ),
    });
  }

  /**
   * Hook para UPDATE - después de actualizar una entidad.
   */
  async afterUpdate(event: UpdateEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;

    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity),
    );

    const newValues = this.sanitizeValues(
      this.entityToObject({
        ...(event.databaseEntity as object),
        ...(event.entity as object),
      }),
    );

    const changedFields = this.getChangedFields(oldValues, newValues);

    if (changedFields.length === 0) return;

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId:
        (event.entity as { id?: string })?.id ||
        (event.databaseEntity as { id?: string })?.id,
      action: AuditAction.UPDATE,
      oldValues,
      newValues,
      changedFields,
    });
  }

  /**
   * Hook para DELETE - antes de eliminar una entidad.
   */
  async beforeRemove(event: RemoveEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;
    if (!event.entity && !event.databaseEntity) return;

    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity || event.entity),
    );

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId:
        (event.entity as { id?: string })?.id ||
        (event.databaseEntity as { id?: string })?.id,
      action: AuditAction.DELETE,
      oldValues,
      newValues: undefined,
      changedFields: undefined,
    });
  }

  /**
   * Hook para SOFT DELETE - antes de soft delete.
   */
  async beforeSoftRemove(event: SoftRemoveEvent<unknown>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;
    if (!event.entity && !event.databaseEntity) return;

    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity || event.entity),
    );

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId:
        (event.entity as { id?: string })?.id ||
        (event.databaseEntity as { id?: string })?.id,
      action: AuditAction.SOFT_DELETE,
      oldValues,
      newValues: {
        ...oldValues,
        deletedAt: new Date(),
        isActive: false,
      },
      changedFields: ['deletedAt', 'isActive'],
    });
  }
}
