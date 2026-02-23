import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { JSONScalar } from '../../../../infrastructure/graphql/scalars';

/**
 * Enum para las acciones de auditoría.
 */
export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
}

registerEnumType(AuditAction, {
  name: 'AuditAction',
  description: 'Tipo de acción realizada en la auditoría',
});

/**
 * Entidad de log de auditoría.
 * Registra automáticamente todas las operaciones de INSERT, UPDATE, DELETE
 * y SOFT_DELETE en las entidades del sistema.
 */
@ObjectType()
@Entity('audit_logs')
@Index(['tableName', 'recordId'])
@Index(['userId'])
@Index(['createdAt'])
@Index(['action'])
export class AuditLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({
    name: 'table_name',
    type: 'varchar',
    length: 100,
  })
  tableName: string;

  @Field(() => ID)
  @Column({
    name: 'record_id',
    type: 'uuid',
  })
  recordId: string;

  @Field(() => AuditAction)
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Field(() => JSONScalar, { nullable: true })
  @Column({
    name: 'old_values',
    type: 'jsonb',
    nullable: true,
  })
  oldValues?: Record<string, any>;

  @Field(() => JSONScalar, { nullable: true })
  @Column({
    name: 'new_values',
    type: 'jsonb',
    nullable: true,
  })
  newValues?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @Column({
    name: 'changed_fields',
    type: 'jsonb',
    nullable: true,
  })
  changedFields?: string[];

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId?: string;

  @Field({ nullable: true })
  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress?: string;

  @Field({ nullable: true })
  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent?: string;

  @Field({ nullable: true })
  @Column({
    name: 'session_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sessionId?: string;

  @Field()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
