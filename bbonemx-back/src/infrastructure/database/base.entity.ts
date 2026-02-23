import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';

/**
 * Entidad base abstracta que incluye campos de auditoría estándar.
 * Todas las entidades de dominio deben extender esta clase.
 * 
 * Campos incluidos:
 * - id: UUID generado automáticamente
 * - createdAt: Fecha de creación
 * - updatedAt: Fecha de última actualización
 * - deletedAt: Fecha de soft delete (null si está activo)
 * - createdBy: UUID del usuario que creó el registro
 * - updatedBy: UUID del usuario que actualizó el registro
 * - deletedBy: UUID del usuario que eliminó el registro
 * - isActive: Flag de activación (soft delete alternativo)
 */
@ObjectType({ isAbstract: true })
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ 
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date;

  @Field({ nullable: true })
  @Column({ 
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string;

  @Field({ nullable: true })
  @Column({ 
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  updatedBy?: string;

  @Field({ nullable: true })
  @Column({ 
    name: 'deleted_by',
    type: 'uuid',
    nullable: true,
  })
  deletedBy?: string;

  @Field()
  @Column({ 
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}
