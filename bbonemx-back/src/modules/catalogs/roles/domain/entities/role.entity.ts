import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;
}