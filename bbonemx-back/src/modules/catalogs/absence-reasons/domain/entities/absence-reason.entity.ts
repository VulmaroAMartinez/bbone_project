import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";

@Entity({name: 'absence_reasons'})
export class AbsenceReason extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;

   @Column({name: 'max_per_week', type: 'int', default: 0, nullable: true})
   maxPerWeek?: number;
}