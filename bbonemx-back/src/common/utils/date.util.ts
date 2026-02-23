/**
 * Utilidades para manejo de fechas en el sistema.
 * Principalmente para scheduling y cálculos de semanas.
 */
export class DateUtil {
  /**
   * Obtiene el inicio de la semana (lunes) para una fecha dada.
   * @param date - Fecha de referencia
   * @returns Fecha del lunes de esa semana a las 00:00:00
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    // Ajustar para que lunes sea el primer día (0 = domingo en JS)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Obtiene el fin de la semana (domingo) para una fecha dada.
   * @param date - Fecha de referencia
   * @returns Fecha del domingo de esa semana a las 23:59:59
   */
  static getEndOfWeek(date: Date = new Date()): Date {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  /**
   * Obtiene el inicio de la siguiente semana.
   * @param date - Fecha de referencia
   * @returns Fecha del lunes de la siguiente semana
   */
  static getNextWeekStart(date: Date = new Date()): Date {
    const startOfWeek = this.getStartOfWeek(date);
    startOfWeek.setDate(startOfWeek.getDate() + 7);
    return startOfWeek;
  }

  /**
   * Obtiene todos los días de una semana.
   * @param startOfWeek - Fecha del inicio de la semana
   * @returns Array de 7 fechas (lunes a domingo)
   */
  static getWeekDays(startOfWeek: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  /**
   * Verifica si dos fechas son el mismo día.
   * @param date1 - Primera fecha
   * @param date2 - Segunda fecha
   * @returns true si son el mismo día
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Verifica si una fecha está dentro de un rango.
   * @param date - Fecha a verificar
   * @param start - Inicio del rango
   * @param end - Fin del rango
   * @returns true si la fecha está dentro del rango (inclusive)
   */
  static isWithinRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  /**
   * Formatea una fecha a string ISO sin timezone.
   * Útil para comparaciones de fechas en BD.
   * @param date - Fecha a formatear
   * @returns String en formato YYYY-MM-DD
   */
  static toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Obtiene el número de semana ISO del año.
   * @param date - Fecha de referencia
   * @returns Número de semana (1-53)
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Agrega días a una fecha.
   * @param date - Fecha base
   * @param days - Días a agregar (puede ser negativo)
   * @returns Nueva fecha
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Agrega horas a una fecha.
   * @param date - Fecha base
   * @param hours - Horas a agregar
   * @returns Nueva fecha
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setTime(result.getTime() + hours * 60 * 60 * 1000);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static getWeekAndYear(date: Date): { weekNumber: number; year: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { weekNumber, year: d.getUTCFullYear() };
  }

  /**
   * Obtiene la fecha de inicio (lunes) de una semana ISO.
   */
  static getWeekStartDate(weekNumber: number, year: number): Date {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
    const result = new Date(mondayOfWeek1);
    result.setUTCDate(mondayOfWeek1.getUTCDate() + (weekNumber - 1) * 7);
    return result;
  }
}
