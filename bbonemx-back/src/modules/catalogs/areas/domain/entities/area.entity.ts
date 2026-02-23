import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { AreaType } from "src/common";

@Entity({name: 'areas'})
export class Area extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;
    @Column({name: 'description', type: 'text', nullable: true})
    description?: string;
    @Column({ type: 'enum', enum: AreaType, default: AreaType.OPERATIONAL })
    type: AreaType;
}