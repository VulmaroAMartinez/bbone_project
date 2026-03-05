import type { ScheduleEntry, AbsenceReasonItem, ValidationError, CellSelection } from '@/components/scheduling/types';

export function normalizeDate(datetime: string): string {
    if (!datetime.includes('T')) return datetime;
    const d = new Date(datetime);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function getWeekNumber(date: Date): { week: number; year: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week: weekNo, year: d.getUTCFullYear() };
}

export function getWeekDates(weekNumber: number, year: number): string[] {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(ISOweekStart);
        d.setDate(ISOweekStart.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

export function formatWeekLabel(weekNumber: number, year: number): string {
    const dates = getWeekDates(weekNumber, year);
    const start = new Date(dates[0]);
    const end = new Date(dates[6]);
    return `Semana ${weekNumber} - ${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function validateAbsenceLimits(
    schedules: ScheduleEntry[],
    absenceReasons: AbsenceReasonItem[],
    technicianId: string,
    weekDates: string[]
): ValidationError[] {
    const errors: ValidationError[] = [];
    const reasonMap = new Map(absenceReasons.map((r) => [r.id, r]));

    const absenceCounts = new Map<string, number>();

    schedules
        .filter(
            (s) =>
                s.technicianId === technicianId &&
                weekDates.includes(normalizeDate(s.scheduleDate)) &&
                s.absenceReasonId
        )
        .forEach((s) => {
            const count = absenceCounts.get(s.absenceReasonId!) || 0;
            absenceCounts.set(s.absenceReasonId!, count + 1);
        });

    absenceCounts.forEach((count, reasonId) => {
        const reason = reasonMap.get(reasonId);
        if (reason && reason.maxPerWeek != null && count > reason.maxPerWeek) {
            const violatingEntries = schedules.filter(
                (s) =>
                    s.technicianId === technicianId &&
                    s.absenceReasonId === reasonId &&
                    weekDates.includes(normalizeDate(s.scheduleDate))
            );

            violatingEntries.forEach((entry) => {
                errors.push({
                    technicianId,
                    date: normalizeDate(entry.scheduleDate),
                    absenceReasonId: reasonId,
                    message: `${reason.name} excede el limite de ${reason.maxPerWeek} por semana`,
                    maxAllowed: reason.maxPerWeek ?? null,
                    currentCount: count,
                });
            });
        }
    });

    return errors;
}

export function getSelectionBounds(
    start: CellSelection,
    end: CellSelection,
    technicianIds: string[],
    dates: string[]
): CellSelection[] {
    const startTechIdx = technicianIds.indexOf(start.technicianId);
    const endTechIdx = technicianIds.indexOf(end.technicianId);
    const startDateIdx = dates.indexOf(start.date);
    const endDateIdx = dates.indexOf(end.date);

    const minTechIdx = Math.min(startTechIdx, endTechIdx);
    const maxTechIdx = Math.max(startTechIdx, endTechIdx);
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);

    const selection: CellSelection[] = [];
    for (let t = minTechIdx; t <= maxTechIdx; t++) {
        for (let d = minDateIdx; d <= maxDateIdx; d++) {
            selection.push({ technicianId: technicianIds[t], date: dates[d] });
        }
    }
    return selection;
}

export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 65%, 50%)`;
}

export function isCellSelected(cell: CellSelection, selection: CellSelection[]): boolean {
    return selection.some((s) => s.technicianId === cell.technicianId && s.date === cell.date);
}

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
