import type {
    ScheduleItemFragment,
    GetScheduleTechniciansQuery,
    GetShiftsQuery,
    GetAbsenceReasonsActiveQuery,
} from '@/lib/graphql/generated/graphql';


export type ScheduleEntry = ScheduleItemFragment;
export type ScheduleTechnician = GetScheduleTechniciansQuery['techniciansWithDeleted'][number];
export type ShiftItem = GetShiftsQuery['shiftsActive'][number];
export type AbsenceReasonItem = GetAbsenceReasonsActiveQuery['absenceReasonsActive'][number];

// --- UI-only types (not GraphQL) ---

export interface CellSelection {
    technicianId: string;
    date: string;
}

export type GridMode = 'edit' | 'query';

export interface ValidationError {
    technicianId: string;
    date: string;
    absenceReasonId: string;
    message: string;
    maxAllowed: number | null;
    currentCount: number;
}

export interface WeeklyTemplate {
    id: string;
    name: string;
    description: string;
    pattern: Array<{ dayOfWeek: number; shiftId?: string; absenceReasonId?: string }>;
}
