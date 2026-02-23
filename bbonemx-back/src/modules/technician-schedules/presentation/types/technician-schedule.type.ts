import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { AbsenceReasonType, ShiftType } from 'src/modules/catalogs';
import { UserType } from 'src/modules/users';

@ObjectType('TechnicianSchedule')
export class TechnicianScheduleType {
    @Field(() => ID)
    id: string;

    @Field(() => ID)
    technicianId: string;

    @Field(() => UserType)
    technician: UserType;

    @Field()
    scheduleDate: Date;

    @Field(() => Int)
    weekNumber: number;

    @Field(() => Int)
    year: number;

    @Field(() => ID, { nullable: true })
    shiftId?: string;

    @Field(() => ShiftType, { nullable: true })
    shift?: ShiftType;

    @Field(() => ID, { nullable: true })
    absenceReasonId?: string;

    @Field(() => AbsenceReasonType, { nullable: true })
    absenceReason?: AbsenceReasonType;

    @Field({ nullable: true })
    notes?: string;

    @Field()
    isActive: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType('WeekScheduleSummary')
export class WeekScheduleSummaryType {
    @Field(() => Int)
    weekNumber: number;

    @Field(() => Int)
    year: number;

    @Field(() => Int)
    totalAssignments: number;

    @Field(() => Int)
    totalWorkDays: number;

    @Field(() => Int)
    totalAbsences: number;

    @Field(() => [TechnicianScheduleType])
    schedules: TechnicianScheduleType[];
}