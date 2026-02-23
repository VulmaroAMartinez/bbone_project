import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { SubArea } from "src/modules/catalogs/sub-areas/domain/entities";

@Entity({name: 'machines'})
export class Machine extends BaseEntity {
    @Column({ type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 200 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'sub_area_id', type: 'uuid' })
    subAreaId: string;

    @ManyToOne(() => SubArea)
    @JoinColumn({ name: 'sub_area_id' })
    subArea: SubArea;

    @Column({ type: 'varchar', length: 100, nullable: true })
    brand?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    model?: string;

    @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
    serialNumber?: string;

    @Column({ name: 'installation_date', type: 'date', nullable: true })
    installationDate?: Date;

    @Column({ name: 'machine_photo_url', type: 'varchar', length: 500, nullable: true })
    machinePhotoUrl?: string;

    @Column({ name: 'operational_manual_url', type: 'varchar', length: 500, nullable: true })
    operationalManualUrl?: string;
}
