import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { WorkOrder } from './work-order.entity';
import { User } from 'src/modules/users/domain/entities';

/** Posibles respuestas a la Pregunta 1 del cuestionario de conformidad */
export enum ConformityQ1Answer {
  YES = 'YES',
  NO = 'NO',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

/**
 * Registro de una respuesta de conformidad por ciclo de OT.
 * Se crea cada vez que el solicitante responde el cuestionario de conformidad.
 */
@Entity({ name: 'work_order_conformity_records' })
export class WorkOrderConformityRecord extends BaseEntity {
  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  /** Número de ciclo (1-based). Incrementa con cada no-conformidad. */
  @Column({ name: 'cycle_number', type: 'integer' })
  cycleNumber: number;

  /**
   * P1: ¿El equipo/estructura quedó en condiciones operativas adecuadas?
   * YES / NO / NOT_APPLICABLE
   */
  @Column({ name: 'question1_answer', type: 'varchar', length: 20 })
  question1Answer: ConformityQ1Answer;

  /** P2: ¿El área de trabajo quedó limpia y segura tras la intervención? */
  @Column({ name: 'question2_answer', type: 'boolean' })
  question2Answer: boolean;

  /** P3: ¿El problema reportado fue resuelto satisfactoriamente? */
  @Column({ name: 'question3_answer', type: 'boolean' })
  question3Answer: boolean;

  /** P4 (decisiva): ¿Estoy conforme con el trabajo realizado? */
  @Column({ name: 'is_conforming', type: 'boolean' })
  isConforming: boolean;

  /** Razón de no conformidad (obligatoria cuando isConforming = false) */
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'responded_by_id', type: 'uuid' })
  respondedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responded_by_id' })
  respondedBy: User;

  @Column({ name: 'responded_at', type: 'timestamp with time zone' })
  respondedAt: Date;

  /** Estado de la OT en el momento de finalizar: FINISHED o TEMPORARY_REPAIR */
  @Column({ name: 'previous_status', type: 'varchar', length: 30 })
  previousStatus: string;
}
