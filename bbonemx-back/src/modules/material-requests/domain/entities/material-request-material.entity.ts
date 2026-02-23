import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { MaterialRequest } from "./material-request.entity";
import { Material } from "src/modules/catalogs/materials/domain/entities";
import { MaterialRequestImportance } from "src/common";

@Entity({name: 'material_request_materials'})
@Unique(['materialRequestId', 'materialId'])
export class MaterialRequestMaterial extends BaseEntity {
    @Column({name: 'material_request_id', type: 'uuid'})
    materialRequestId: string;

    @ManyToOne(() => MaterialRequest, (mr) => mr.materials, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'material_request_id'})
    materialRequest: MaterialRequest;

    @Column({name: 'material_id', type: 'uuid'})
    materialId: string;

    @ManyToOne(() => Material)
    @JoinColumn({name: 'material_id'})
    material: Material;

    @Column({type: 'integer'})
    quantity: number;

    @Column({type: 'enum', enum: MaterialRequestImportance, nullable: true})
    importance?: MaterialRequestImportance;

    @Column({name: 'minimum_stock', type: 'integer', nullable: true})
    minimumStock?: number;

    @Column({name: 'maximum_stock', type: 'integer', nullable: true})
    maximumStock?: number;
}
