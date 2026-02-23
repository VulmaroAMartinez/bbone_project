import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";

@Entity({name: 'materials'})
export class Material extends BaseEntity {
    @Column({type: 'text'})
    description: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    brand?: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    model?: string;

    @Column({name: 'part_number', type: 'varchar', length: 100, nullable: true})
    partNumber?: string;

    @Column({type: 'varchar', length: 100, nullable: true, unique: true})
    sku?: string;

    @Column({type: 'varchar', length: 200, nullable: true})
    manufacturer?: string;

    @Column({name: 'unit_of_measure', type: 'varchar', length: 50, nullable: true})
    unitOfMeasure?: string;
}
