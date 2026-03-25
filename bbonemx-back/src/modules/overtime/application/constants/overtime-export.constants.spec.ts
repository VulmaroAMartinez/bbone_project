import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import {
  buildOvertimeReportHeader,
  OVERTIME_EXCEL_COLUMNS,
} from './overtime-export.constants';

describe('overtime-export.constants', () => {
  const getColumn = (header: string) =>
    OVERTIME_EXCEL_COLUMNS.find((col) => col.header === header);

  it('aplica regla de cantidad para día festivo/descanso laborado', () => {
    const quantity = getColumn('CANTIDAD');
    expect(quantity).toBeDefined();

    const row = {
      reasonForPayment: ReasonForPayment.HOLIDAY,
      startTime: '08:00:00',
      endTime: '12:00:00',
    };

    expect(quantity!.transform?.(undefined, row as any)).toBe('1');
  });

  it('aplica regla de cantidad para tiempo extra con horas calculadas', () => {
    const quantity = getColumn('CANTIDAD');
    expect(quantity).toBeDefined();

    const row = {
      reasonForPayment: ReasonForPayment.OVERTIME,
      startTime: '08:30:00',
      endTime: '11:00:00',
    };

    expect(quantity!.transform?.(undefined, row as any)).toBe('2.5');
  });

  it('construye observaciones para tiempo extra con fecha + rango + actividad', () => {
    const observations = getColumn('OBSERVACIONES');
    expect(observations).toBeDefined();

    const date = new Date(2026, 2, 25);
    const dateLabel = date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const row = {
      workDate: date,
      reasonForPayment: ReasonForPayment.OVERTIME,
      startTime: '06:00:00',
      endTime: '08:00:00',
      activity: 'Mantenimiento preventivo',
    };

    expect(observations!.transform?.(undefined, row as any)).toBe(
      `${dateLabel} 06:00 - 08:00 Mantenimiento preventivo`,
    );
  });

  it('incluye periodo en encabezado del reporte', () => {
    const header = buildOvertimeReportHeader('2026-03-01', '2026-03-15');
    expect(header).toContain('Empresa: Bumble Bee Mexico S de RL de CV');
    expect(header).toContain('Área: Mantenimiento');
    expect(header).toContain('PERIODO:');
    expect(header).toContain('al');
  });
});

