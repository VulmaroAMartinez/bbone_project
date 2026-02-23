import { FindingStatus, FolioGenerator } from "src/common";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { Area, Machine, Shift } from "src/modules/catalogs";
import { User } from "src/modules/users/domain/entities";
import { WorkOrder } from "src/modules/work-orders/domain/entities/work-order.entity";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity({name: 'findings'})
export class Finding extends BaseEntity {

    @Column({name: 'sequence', type: 'integer', generated: 'increment'})
    sequence: number;

    @Index({unique: true})
    @Column({type: 'varchar', length: 20, unique: true})
    folio: string;

    @Column({name: 'area_id', type: 'uuid'})
    areaId: string;

    @ManyToOne(() => Area)
    @JoinColumn({name: 'area_id'})
    area: Area;

    @Column({name: 'machine_id', type: 'uuid'})
    machineId: string;

    @ManyToOne(() => Machine)
    @JoinColumn({name: 'machine_id'})
    machine: Machine;

    @Column({name: 'shift_id', type: 'uuid'})
    shiftId: string;

    @ManyToOne(() => Shift)
    @JoinColumn({name: 'shift_id'})
    shift: Shift;

    @Column({name: 'description', type: 'text'})
    description: string;

    @Column({name: 'photo_path', type: 'varchar', length: 500})
    photoPath: string;

    @Column({type: 'enum', enum: FindingStatus, default: FindingStatus.OPEN})
    status: FindingStatus;

    @Column({ name: 'converted_to_wo_id', type: 'uuid', nullable: true })
    convertedToWoId?: string;

    @ManyToOne(() => WorkOrder, { nullable: true })
    @JoinColumn({ name: 'converted_to_wo_id' })
    convertedToWo?: WorkOrder;
  
    @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
    convertedAt?: Date;
  
    @Column({ name: 'converted_by', type: 'uuid', nullable: true })
    convertedBy?: string;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'converted_by' })
    converter?: User;

    @BeforeInsert()
    generateFolio() {
        if(!this.folio) {
            const now = new Date();
            const index = this.sequence;
            this.folio = FolioGenerator.generateFindingFolio(index, now);
        }
    }

    isOpen() : boolean {
        return this.status === FindingStatus.OPEN;
    }

    isConvertedToWo() : boolean {
        return this.status === FindingStatus.CONVERTED_TO_WO;
    }
    
    canBeConvertedToWo() : boolean {
        return this.status === FindingStatus.OPEN && this.shiftId !== null && this.areaId !== null;
    }

}