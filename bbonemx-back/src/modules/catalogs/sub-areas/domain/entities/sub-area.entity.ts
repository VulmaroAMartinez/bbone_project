import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { Area } from "src/modules/catalogs/areas/domain/entities";

@Entity({name: 'sub_areas'})
export class SubArea extends BaseEntity {
    @Column({name: 'area_id', type: 'uuid'})
    areaId: string;

    @ManyToOne(() => Area)
    @JoinColumn({name: 'area_id'})
    area: Area;

    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;

    @Column({name: 'description', type: 'text', nullable: true})
    description?: string;
}
