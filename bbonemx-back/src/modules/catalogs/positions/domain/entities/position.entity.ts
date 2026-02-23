import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';

@Entity('positions')
export class Position extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}