import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { User } from 'src/modules/users/domain/entities';
import { Area } from 'src/modules/catalogs/areas/domain/entities';
import { SubArea } from 'src/modules/catalogs/sub-areas/domain/entities';
import { Machine, Shift } from 'src/modules/catalogs';
import { WorkOrderStatus, WorkOrderPriority, MaintenanceType, StopType } from 'src/common';
import { Finding } from 'src/modules/findings/domain/entities/finding.entity';
import { PreventiveTask } from 'src/modules/preventive-tasks/domain/entities/preventive-task.entity';

@Entity({name: 'work_orders'})
export class WorkOrder extends BaseEntity {

    @Column({name: 'sequence', type: 'integer'})
    sequence: number;

    @Index({unique: true})
    @Column({type: 'varchar', length: 20, unique: true})
    folio: string;

    @Column({name: 'area_id', type: 'uuid'})
    areaId: string;

    @ManyToOne(() => Area)
    @JoinColumn({name: 'area_id'})
    area: Area;

    @Column({name: 'sub_area_id', type: 'uuid', nullable: true})
    subAreaId?: string;

    @ManyToOne(() => SubArea, {nullable: true})
    @JoinColumn({name: 'sub_area_id'})
    subArea?: SubArea;

    @Column({type: 'text'})
    description: string;

    @Column({
        type: 'enum',
        enum: WorkOrderStatus,
        default: WorkOrderStatus.PENDING,
    })
    status: WorkOrderStatus;

    @Column({
        type: 'enum',
        enum: WorkOrderPriority,
        nullable: true,
    })
    priority?: WorkOrderPriority;

    @Column({
        name: 'maintenance_type',
        type: 'enum',
        enum: MaintenanceType,
        nullable: true,
    })
    maintenanceType?: MaintenanceType;

    @Column({
        name: 'stop_type',
        type: 'enum',
        enum: StopType,
        nullable: true,
    })
    stopType?: StopType;

    @Column({name: 'assigned_shift_id', type: 'uuid', nullable: true})
    assignedShiftId?: string;

    @ManyToOne(() => Shift, {nullable: true})
    @JoinColumn({name: 'assigned_shift_id'})
    assignedShift?: Shift;

    @Column({name: 'requester_id', type: 'uuid'})
    requesterId: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'requester_id'})
    requester: User;

    @Column({name: 'machine_id', type: 'uuid', nullable: true})
    machineId?: string;

    @ManyToOne(() => Machine, {nullable: true})
    @JoinColumn({name: 'machine_id'})
    machine?: Machine;

    @Column({name: 'start_date', type: 'timestamp', nullable: true})
    startDate?: Date;

    @Column({name: 'end_date', type: 'timestamp', nullable: true})
    endDate?: Date;

    @Column({type: 'text', nullable: true})
    observations?: string;

    @Column({name:'breakdown_description', type: 'text', nullable: true})
    breakdownDescription?: string;

    @Column({type: 'text', nullable: true})
    cause?: string;

    @Column({name:'action_taken', type: 'text', nullable: true})
    actionTaken?: string;

    @Column({name:'tools_used', type: 'text', nullable: true})
    toolsUsed?: string;

    @Column({name:'downtime_minutes', type: 'integer', nullable: true})
    downtimeMinutes?: number;

    @Column({name: 'pause_reason', type: 'text', nullable: true})
    pauseReason?: string;

    @Column({name: 'functional_time_minutes', type: 'integer', default: 0})
    functionalTimeMinutes: number;

    @Column({name: 'last_resumed_at', type: 'timestamp', nullable: true})
    lastResumedAt?: Date | null;

    @Column({name: 'finding_id', type: 'uuid', nullable: true})
    findingId?: string;

    @ManyToOne(() => Finding, {nullable: true})
    @JoinColumn({name: 'finding_id'})
    finding?: Finding;

    @Column({name:'preventive_task_id', type: 'uuid', nullable: true})
    preventiveTaskId?: string;

    @ManyToOne(() => PreventiveTask, {nullable: true})
    @JoinColumn({name: 'preventive_task_id'})
    preventiveTask?: PreventiveTask;

    canStart(): boolean {
        return this.status === WorkOrderStatus.PENDING;
    }

    canPause(): boolean {
        return this.status === WorkOrderStatus.IN_PROGRESS;
    }

    canResume(): boolean {
        return this.status === WorkOrderStatus.PAUSED;
    }

    canComplete(): boolean {
        return this.status === WorkOrderStatus.IN_PROGRESS;
    }

    getElapsedTime(): number | null{
        if(!this.startDate) return null;
        const end = this.endDate || new Date();
        return Math.floor((end.getTime() - this.startDate.getTime()) / 60000);
    }

    getFunctionalTimeMinutes(at: Date = new Date()): number | null {
        const accumulated = this.functionalTimeMinutes || 0;
        if(this.status === WorkOrderStatus.IN_PROGRESS && this.lastResumedAt) {
            const segment = Math.max(0, Math.floor((at.getTime() - this.lastResumedAt.getTime()) / 60000));
            return accumulated + segment;
        }
        return accumulated;
    }

}

