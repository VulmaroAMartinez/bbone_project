import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, OneToMany } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { Machine } from "src/modules/catalogs/machines/domain/entities";
import { MaterialRequestPriority, FolioGenerator } from "src/common";
import { MaterialRequestMaterial } from "./material-request-material.entity";

@Entity({name: 'material_requests'})
export class MaterialRequest extends BaseEntity {
    @Column({name: 'sequence', type: 'integer', generated: 'increment'})
    sequence: number;

    @Index({unique: true})
    @Column({type: 'varchar', length: 20, unique: true})
    folio: string;

    @Column({name: 'machine_id', type: 'uuid'})
    machineId: string;

    @ManyToOne(() => Machine)
    @JoinColumn({name: 'machine_id'})
    machine: Machine;

    @Column({name: 'request_text', type: 'text'})
    requestText: string;

    @Column({type: 'enum', enum: MaterialRequestPriority})
    priority: MaterialRequestPriority;

    @Column({type: 'text', nullable: true})
    justification?: string;

    @Column({name: 'is_generic_or_alternative_model', type: 'boolean', default: false})
    isGenericOrAlternativeModel: boolean;

    @Column({type: 'text', nullable: true})
    comments?: string;

    @Column({name: 'suggested_supplier', type: 'varchar', length: 200, nullable: true})
    suggestedSupplier?: string;

    @OneToMany(() => MaterialRequestMaterial, (mrm) => mrm.materialRequest, { cascade: true })
    materials: MaterialRequestMaterial[];

    @BeforeInsert()
    generateFolio() {
        if(!this.folio) {
            const now = new Date();
            const index = this.sequence;
            this.folio = FolioGenerator.generateMaterialRequestFolio(index, now);
        }
    }
}
