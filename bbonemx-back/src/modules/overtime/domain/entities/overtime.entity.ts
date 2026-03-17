import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { Technician } from 'src/modules/catalogs/technicians/domain/entities';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import { dateColumnTransformer } from 'src/common/transformers';

@Entity({ name: 'overtime' })
export class Overtime extends BaseEntity {
  @Column({
    name: 'work_date',
    type: 'date',
    transformer: dateColumnTransformer,
  })
  workDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ type: 'text' })
  activity: string;

  @Column({
    name: 'reason_for_payment',
    type: 'enum',
    enum: ReasonForPayment,
    nullable: true,
  })
  reasonForPayment?: ReasonForPayment;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => Technician)
  @JoinColumn({ name: 'technician_id' })
  technician: Technician;

  /**
   * Calcula work_time como diferencia entre end_time y start_time.
   * Retorna formato "Xh Ym".
   */
  get workTime(): string {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    let totalMinutes = eh * 60 + em - (sh * 60 + sm);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // cruza medianoche
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}
