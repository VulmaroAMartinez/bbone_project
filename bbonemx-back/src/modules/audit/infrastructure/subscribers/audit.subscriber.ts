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
const EXCLUDED_ENTITIES = [
  'AuditLog',
  'migrations',
];

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

  /**
   * Verifica si la entidad debe ser auditada.
   */
  private shouldAudit(entityName: string): boolean {
    return !EXCLUDED_ENTITIES.includes(entityName);
  }

  /**
   * Limpia los valores sensibles de un objeto.
   */
  private sanitizeValues(values: Record<string, any>): Record<string, any> {
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
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
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
      // Obtener contexto del usuario desde AsyncLocalStorage
      const context = UserContext.getCurrentContext();

      const auditLog = manager.create(AuditLog, {
        ...data,
        userId: context?.userId,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        sessionId: context?.sessionId,
      });

      // Usar query builder para evitar triggers recursivos
      await manager
        .createQueryBuilder()
        .insert()
        .into(AuditLog)
        .values(auditLog)
        .execute();
    } catch (error) {
      // Log del error pero no interrumpir la operación principal
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Convierte una entidad a un objeto plano para auditoría.
   */
  private entityToObject(entity: any): Record<string, any> {
    if (!entity) return {};

    // Si ya es un objeto plano, retornarlo
    if (typeof entity !== 'object') return {};

    const result: Record<string, any> = {};
    
    for (const key of Object.keys(entity)) {
      const value = entity[key];
      
      // Excluir funciones y relaciones complejas
      if (typeof value === 'function') continue;
      if (value && typeof value === 'object' && value.constructor?.name !== 'Object' && value.constructor?.name !== 'Array' && !(value instanceof Date)) {
        // Es una relación o entidad anidada, guardamos solo el ID si existe
        if (value.id) {
          result[`${key}Id`] = value.id;
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
  async afterInsert(event: InsertEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;

    const newValues = this.sanitizeValues(this.entityToObject(event.entity));

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId: event.entity?.id,
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
  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;

    // Obtener valores anteriores del databaseEntity
    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity),
    );

    // Obtener nuevos valores combinando databaseEntity con los cambios
    const newValues = this.sanitizeValues(
      this.entityToObject({
        ...event.databaseEntity,
        ...event.entity,
      }),
    );

    const changedFields = this.getChangedFields(oldValues, newValues);

    // Solo crear log si realmente hubo cambios
    if (changedFields.length === 0) return;

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId: event.entity?.id || event.databaseEntity?.id,
      action: AuditAction.UPDATE,
      oldValues,
      newValues,
      changedFields,
    });
  }

  /**
   * Hook para DELETE - antes de eliminar una entidad.
   */
  async beforeRemove(event: RemoveEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;
    if (!event.entity && !event.databaseEntity) return;

    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity || event.entity),
    );

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId: event.entity?.id || event.databaseEntity?.id,
      action: AuditAction.DELETE,
      oldValues,
      newValues: undefined,
      changedFields: undefined,
    });
  }

  /**
   * Hook para SOFT DELETE - antes de soft delete.
   */
  async beforeSoftRemove(event: SoftRemoveEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!this.shouldAudit(entityName)) return;
    if (!event.entity && !event.databaseEntity) return;

    const oldValues = this.sanitizeValues(
      this.entityToObject(event.databaseEntity || event.entity),
    );

    await this.createAuditLog(event.manager, {
      tableName: event.metadata.tableName,
      recordId: event.entity?.id || event.databaseEntity?.id,
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
