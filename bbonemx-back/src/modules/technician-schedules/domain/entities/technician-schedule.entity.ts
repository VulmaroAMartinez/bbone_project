import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { User } from 'src/modules/users/domain/entities';
import { Shift } from 'src/modules/catalogs/shifts/domain/entities';
import { AbsenceReason } from 'src/modules/catalogs/absence-reasons/domain/entities';

@Entity({ name: 'technician_schedules' })
@Unique('UQ_technician_schedule_date', ['technicianId', 'scheduleDate'])
export class TechnicianSchedule extends BaseEntity {

    @Column({ name: 'technician_id', type: 'uuid' })
    technicianId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'technician_id' })
    technician: User;

    @Column({ name: 'schedule_date', type: 'date' })
    scheduleDate: Date;

    @Column({ name: 'week_number', type: 'int' })
    weekNumber: number;

    @Column({ name: 'year', type: 'int' })
    year: number;

    @Column({ name: 'shift_id', type: 'uuid', nullable: true })
    shiftId?: string;

    @ManyToOne(() => Shift, { nullable: true })
    @JoinColumn({ name: 'shift_id' })
    shift?: Shift;

    @Column({ name: 'absence_reason_id', type: 'uuid', nullable: true })
    absenceReasonId?: string;

    @ManyToOne(() => AbsenceReason, { nullable: true })
    @JoinColumn({ name: 'absence_reason_id' })
    absenceReason?: AbsenceReason;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    
    isWorkDay(): boolean {
        return this.shiftId !== null && this.shiftId !== undefined;
    }

    
    isAbsence(): boolean {
        return this.absenceReasonId !== null && this.absenceReasonId !== undefined;
    }
}