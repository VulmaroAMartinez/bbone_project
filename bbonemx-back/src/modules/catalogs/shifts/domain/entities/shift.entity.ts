import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";

@Entity({name: 'shifts'})
export class Shift extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;

    @Column({name: 'start_time', type: 'time'})
    startTime: string;

    @Column({name: 'end_time', type: 'time'})
    endTime: string;
}