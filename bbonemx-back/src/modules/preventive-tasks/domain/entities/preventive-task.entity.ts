import { BaseEntity } from "src/infrastructure/database/base.entity";
import { Machine } from "src/modules/catalogs";
import { Column, Entity, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { DateUtil, FrequencyType, FrequencyUnit, PreventiveTaskStatus } from "src/common";

@Entity({ name: 'preventive_tasks' })
export class PreventiveTask extends BaseEntity {
    @Column({ name: 'machine_id', type: 'uuid' })
    machineId: string;

    @ManyToOne(() => Machine)
    @JoinColumn({ name: 'machine_id' })
    machine: Machine;

    @Column({ name: 'description', type: 'text' })
    description: string;

    @Column({ name: 'frequency_type', type: 'enum', enum: FrequencyType })
    frequencyType: FrequencyType;

    @Column({ name: 'frequency_unit', type: 'enum', enum: FrequencyUnit, nullable: true })
    frequencyUnit?: FrequencyUnit;

    @Column({ name: 'frequency_value', type: 'integer', nullable: true })
    frequencyValue?: number;

    @Column({ name: 'start_date', type: 'date'})
    startDate: Date;

    @Column({ name: 'next_execution_date', type: 'timestamp', nullable: true })
    nextExecutionDate?: Date;

    @Column({ name: 'advance_hours', type: 'int', default: 24 })
    advanceHours: number;

    @Column({ type: 'enum', enum: PreventiveTaskStatus, default: PreventiveTaskStatus.ACTIVE })
    status: PreventiveTaskStatus;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate?: Date;

    @Column({ name: 'policy_change_note', type: 'text', nullable: true })
    policyChangeNote?: string;

    @Column({ name: 'parent_task_id', type: 'uuid', nullable: true })
    parentTaskId?: string;
  
    @ManyToOne(() => PreventiveTask, { nullable: true })
    @JoinColumn({ name: 'parent_task_id' })
    parentTask?: PreventiveTask;

    @Column({ name: 'last_wo_generated_at', type: 'timestamp', nullable: true })
    lastWoGeneratedAt?: Date;

    @BeforeInsert()
    calculateInitialNextExecution() {
        if (!this.nextExecutionDate) {
            this.nextExecutionDate = this.calculateNextExecutionDate(new Date(this.startDate));
        }
    }

    calculateNextExecutionDate(fromDate: Date): Date {
        switch (this.frequencyType) {
            case FrequencyType.DAILY:
              return DateUtil.addDays(fromDate, 1);
            case FrequencyType.WEEKLY:
              return DateUtil.addDays(fromDate, 7);
            case FrequencyType.MONTHLY:
              return DateUtil.addMonths(fromDate, 1);
            case FrequencyType.CUSTOM:
              if (this.frequencyValue && this.frequencyUnit) {
                if (this.frequencyUnit === FrequencyUnit.DAYS) {
                  return DateUtil.addDays(fromDate, this.frequencyValue);
                } else if (this.frequencyUnit === FrequencyUnit.HOURS) {
                  return DateUtil.addHours(fromDate, this.frequencyValue);
                }
              }
              return new Date(fromDate);
            default:
              return new Date(fromDate);
          }
    }

    shouldGenerateWorkOrder(): boolean {
        if (this.status !== PreventiveTaskStatus.ACTIVE) return false;
        if (!this.nextExecutionDate) return false;

        const now = new Date();
        const triggerDate = DateUtil.addHours(this.nextExecutionDate, -this.advanceHours);

        return now >= triggerDate;
    }

    advanceNextExecution(): void {
        this.lastWoGeneratedAt = new Date();
        this.nextExecutionDate = this.calculateNextExecutionDate(this.nextExecutionDate || new Date());
    }

    isPreventiveTaskActive(): boolean {
        return this.status === PreventiveTaskStatus.ACTIVE;
    }

    getFrequencyDescription(): string {
        switch (this.frequencyType) {
          case FrequencyType.DAILY:
            return 'Diario';
          case FrequencyType.WEEKLY:
            return 'Semanal';
          case FrequencyType.MONTHLY:
            return 'Mensual';
          case FrequencyType.CUSTOM:
            const unit = this.frequencyUnit === FrequencyUnit.HOURS ? 'horas' : 'días';
            return `Cada ${this.frequencyValue} ${unit}`;
          default:
            return 'Desconocido';
        }
    }
}
