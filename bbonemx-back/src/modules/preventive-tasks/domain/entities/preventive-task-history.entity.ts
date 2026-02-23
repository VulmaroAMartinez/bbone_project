import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { PreventiveTask } from './preventive-task.entity';
import { User } from 'src/modules/users/domain/entities';
import { PreventiveTaskHistoryAction } from 'src/common';

/**
 * Historial de cambios en tareas preventivas (auditoría de políticas).
 * No extiende BaseEntity ya que tiene su propia estructura de auditoría.
 */
@Entity({ name: 'preventive_task_history' })
export class PreventiveTaskHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'preventive_task_id', type: 'uuid' })
    preventiveTaskId: string;

    @ManyToOne(() => PreventiveTask)
    @JoinColumn({ name: 'preventive_task_id' })
    preventiveTask: PreventiveTask;

    @Column({
        type: 'enum',
        enum: PreventiveTaskHistoryAction,
    })
    action: PreventiveTaskHistoryAction;

    @Column({ name: 'previous_values', type: 'jsonb', nullable: true })
    previousValues?: Record<string, any>;

    @Column({ name: 'new_values', type: 'jsonb', nullable: true })
    newValues?: Record<string, any>;

    @Column({ name: 'change_reason', type: 'text', nullable: true })
    changeReason?: string;

    @CreateDateColumn({ name: 'changed_at', type: 'timestamp with time zone' })
    changedAt: Date;

    @Column({ name: 'changed_by', type: 'uuid', nullable: true })
    changedById?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'changed_by' })
    changedBy?: User;
}
