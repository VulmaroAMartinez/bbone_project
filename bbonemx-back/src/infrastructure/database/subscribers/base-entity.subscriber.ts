import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { UserContext } from '../../../common/context/user.context';

/**
 * Subscriber que automáticamente asigna createdBy y updatedBy
 * en las entidades que heredan de BaseEntity.
 * 
 * Utiliza AsyncLocalStorage para obtener el userId del contexto
 * actual sin necesidad de pasarlo como parámetro.
 */
@EventSubscriber()
export class BaseEntitySubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  /**
   * Antes de insertar, asigna createdBy si la entidad tiene ese campo.
   */
  beforeInsert(event: InsertEvent<any>): void {
    if (!event.entity) return;

    const userId = UserContext.getCurrentUserId();
    if (!userId) return;

    // Verificar si la entidad tiene el campo createdBy
    const columns = event.metadata.columns.map((col) => col.propertyName);

    if (columns.includes('createdBy') && !event.entity.createdBy) {
      event.entity.createdBy = userId;
    }

    if (columns.includes('updatedBy') && !event.entity.updatedBy) {
      event.entity.updatedBy = userId;
    }
  }

  /**
   * Antes de actualizar, asigna updatedBy si la entidad tiene ese campo.
   */
  beforeUpdate(event: UpdateEvent<any>): void {
    if (!event.entity) return;

    const userId = UserContext.getCurrentUserId();
    if (!userId) return;

    // Verificar si la entidad tiene el campo updatedBy
    const columns = event.metadata.columns.map((col) => col.propertyName);

    if (columns.includes('updatedBy')) {
      event.entity.updatedBy = userId;
    }
  }
}
