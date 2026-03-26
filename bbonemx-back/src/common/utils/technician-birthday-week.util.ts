/**
 * Utilidades para la semana calendario (lunes–domingo) en una zona horaria IANA.
 * Usado por el notificador semanal de cumpleaños de técnicos.
 */

const WEEKDAY_SHORT_TO_OFFSET_FROM_MON: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export interface CalendarYmd {
  y: number;
  m: number;
  d: number;
}

export interface WeekInTimeZoneResult {
  /** Claves MM-DD para consultas SQL o filtrado */
  monthDayKeys: string[];
  /** Primer día de la semana (lunes) en la zona */
  weekStart: CalendarYmd;
  /** Último día de la semana (domingo) en la zona */
  weekEnd: CalendarYmd;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toMonthDayKey(ymd: CalendarYmd): string {
  return `${pad2(ymd.m)}-${pad2(ymd.d)}`;
}

/** Fecha civil (Y-M-D) en la zona horaria para un instante UTC. */
export function formatYmdInTimeZone(
  instant: Date,
  timeZone: string,
): CalendarYmd {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);

  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return { y, m, d };
}

function weekdayShortInTimeZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(instant);
}

/** Suma días al calendario civil (evita desfases de TZ del servidor). */
export function addCalendarDays(
  ymd: CalendarYmd,
  deltaDays: number,
): CalendarYmd {
  const dt = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d + deltaDays));
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

/**
 * Semana que contiene `anchor` (lunes–domingo), interpretada en `timeZone`.
 */
export function getMondayToSundayWeekInTimeZone(
  anchor: Date,
  timeZone: string,
): WeekInTimeZoneResult {
  const today = formatYmdInTimeZone(anchor, timeZone);
  const short = weekdayShortInTimeZone(anchor, timeZone);
  const offsetFromMonday = WEEKDAY_SHORT_TO_OFFSET_FROM_MON[short] ?? 0;
  const weekStart = addCalendarDays(today, -offsetFromMonday);
  const monthDayKeys: string[] = [];
  for (let i = 0; i < 7; i++) {
    monthDayKeys.push(toMonthDayKey(addCalendarDays(weekStart, i)));
  }
  const weekEnd = addCalendarDays(weekStart, 6);
  return { monthDayKeys, weekStart, weekEnd };
}

export function formatSpanishDayMonth(ymd: CalendarYmd): string {
  const d = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d, 12, 0, 0));
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(d);
}

export function formatSpanishWeekRangeTitle(
  start: CalendarYmd,
  end: CalendarYmd,
): string {
  const startLabel = formatSpanishDayMonth(start);
  const endLabel = formatSpanishDayMonth(end);
  if (start.y === end.y) {
    return `Semana del ${startLabel} al ${endLabel} de ${end.y}`;
  }
  return `Semana del ${startLabel} de ${start.y} al ${endLabel} de ${end.y}`;
}
