import { DateUtil } from './date.util';

describe('DateUtil', () => {
  // Miércoles 8 de enero 2026
  const wednesday = new Date(2026, 0, 8, 12, 0, 0);

  describe('getStartOfWeek', () => {
    it('retorna el lunes de la semana', () => {
      const start = DateUtil.getStartOfWeek(wednesday);
      expect(start.getDay()).toBe(1); // lunes
      expect(start.getDate()).toBe(5);
      expect(start.getHours()).toBe(0);
    });

    it('para domingo retrocede al lunes anterior', () => {
      const sunday = new Date(2026, 0, 11); // domingo
      const start = DateUtil.getStartOfWeek(sunday);
      expect(start.getDate()).toBe(5);
    });
  });

  describe('getEndOfWeek', () => {
    it('retorna el domingo a las 23:59:59', () => {
      const end = DateUtil.getEndOfWeek(wednesday);
      expect(end.getDay()).toBe(0); // domingo
      expect(end.getDate()).toBe(11);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe('getNextWeekStart', () => {
    it('retorna el lunes de la próxima semana', () => {
      const next = DateUtil.getNextWeekStart(wednesday);
      expect(next.getDay()).toBe(1);
      expect(next.getDate()).toBe(12);
    });
  });

  describe('getWeekDays', () => {
    it('retorna 7 días empezando desde el lunes dado', () => {
      const start = DateUtil.getStartOfWeek(wednesday);
      const days = DateUtil.getWeekDays(start);
      expect(days).toHaveLength(7);
      expect(days[0].getDay()).toBe(1); // lunes
      expect(days[6].getDay()).toBe(0); // domingo
    });
  });
});
