import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";

@Entity({name: 'departments'})
export class Department extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;
    @Column({name: 'description', type: 'text', nullable: true})
    description?: string;
}
