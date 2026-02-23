/**
 * Interface que define los campos de auditoría estándar.
 * Todas las entidades del dominio deben implementar esta interface.
 */
export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  isActive: boolean;
}

/**
 * Interface para entidades que soportan soft delete.
 */
export interface ISoftDeletable {
  deletedAt?: Date | null;
  isActive: boolean;
}

/**
 * Interface para entidades que rastrean quién las modificó.
 */
export interface IAuditable {
  createdBy?: string | null;
  updatedBy?: string | null;
}
