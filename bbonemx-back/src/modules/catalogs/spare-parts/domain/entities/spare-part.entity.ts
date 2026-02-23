import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { Machine } from "src/modules/catalogs/machines/domain/entities";

@Entity({name: 'spare_parts'})
export class SparePart extends BaseEntity {
    @Column({name: 'machine_id', type: 'uuid'})
    machineId: string;

    @ManyToOne(() => Machine)
    @JoinColumn({name: 'machine_id'})
    machine: Machine;

    @Column({name: 'part_number', type: 'varchar', length: 100})
    partNumber: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    brand?: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    model?: string;

    @Column({type: 'varchar', length: 200, nullable: true})
    supplier?: string;

    @Column({name: 'unit_of_measure', type: 'varchar', length: 50, nullable: true})
    unitOfMeasure?: string;
}
