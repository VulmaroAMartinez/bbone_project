import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import type { Overtime } from '../../domain/entities';
import type {
  ExcelColumnDefinition,
  ExcelReportDefinition,
} from 'src/infrastructure/excel';
import type { PdfTableDefinition } from 'src/infrastructure/pdf';

export const COMPANY_NAME = 'Bumble Bee Mexico S de RL de CV';
export const AREA_NAME = 'Mantenimiento';

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

function calculateHours(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return 0;

  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;

  return Number((minutes / 60).toFixed(2));
}

function buildQuantity(row: Overtime): string {
  if (
    row.reasonForPayment === ReasonForPayment.HOLIDAY ||
    row.reasonForPayment === ReasonForPayment.WORK_BREAK
  ) {
    return '1';
  }

  const hours = calculateHours(row.startTime, row.endTime);
  return hours > 0 ? `${hours}` : '0';
}

function buildReasonLabel(reason?: ReasonForPayment): string {
  switch (reason) {
    case ReasonForPayment.HOLIDAY:
      return 'Día festivo';
    case ReasonForPayment.WORK_BREAK:
      return 'Descanso laborado';
    case ReasonForPayment.OVERTIME:
      return 'Tiempo extra';
    default:
      return '';
  }
}

function buildObservations(row: Overtime): string {
  const date = formatDate(row.workDate);
  const activity = row.activity || '';

  if (
    row.reasonForPayment === ReasonForPayment.HOLIDAY ||
    row.reasonForPayment === ReasonForPayment.WORK_BREAK
  ) {
    return `${date} ${activity}`.trim();
  }

  const start = formatTime(row.startTime);
  const end = formatTime(row.endTime);
  return `${date} ${start} - ${end} ${activity}`.trim();
}

export function formatOvertimePeriodLabel(
  periodFrom?: string,
  periodTo?: string,
): string {
  if (!periodFrom && !periodTo) return '';

  const from = periodFrom ? new Date(periodFrom) : null;
  const to = periodTo ? new Date(periodTo) : null;
  if (from && Number.isNaN(from.getTime())) return '';
  if (to && Number.isNaN(to.getTime())) return '';

  const fromDay = from ? from.getDate() : '';
  const toDay = to ? to.getDate() : '';
  const toYear = to ? to.getFullYear() : from ? from.getFullYear() : '';

  // Evitamos `formatDate()` aquí porque el ejemplo del cliente usa nombre de mes.
  const monthName = to
    ? to.toLocaleDateString('es-MX', { month: 'long' })
    : from
      ? from.toLocaleDateString('es-MX', { month: 'long' })
      : '';

  if (periodFrom && periodTo) {
    return `${fromDay} al ${toDay} de ${monthName} ${toYear}`;
  }

  if (periodFrom && !periodTo) {
    return `${fromDay} de ${monthName} ${toYear}`;
  }

  return `al ${toDay} de ${monthName} ${toYear}`;
}

export function buildOvertimeReportHeader(periodFrom?: string, periodTo?: string): string {
  const elaborationDate = formatDate(new Date());
  const periodLabel = formatOvertimePeriodLabel(periodFrom, periodTo);

  return [
    `Empresa: ${COMPANY_NAME}`,
    `Área: ${AREA_NAME}`,
    `Fecha de elaboración: ${elaborationDate}`,
    `Fecha de entrega a nómina: ${elaborationDate}`,
    `PERIODO: ${periodLabel}`,
  ].join('\n');
}

export const OVERTIME_EXCEL_COLUMNS: ExcelColumnDefinition<Overtime>[] = [
  {
    header: 'NÓMINA',
    key: 'technician.user.employeeNumber',
    width: 14,
    transform: (value) => value || '',
  },
  {
    header: 'NOMBRE COMPLETO',
    key: 'technician.user',
    width: 30,
    transform: (_value, row) =>
      `${row.technician?.user?.firstName ?? ''} ${row.technician?.user?.lastName ?? ''}`.trim(),
  },
  {
    header: 'PUESTO',
    key: 'technician.position.name',
    width: 18,
    transform: (value) => value || '',
  },
  {
    header: 'CONCEPTO DE PAGO',
    key: 'reasonForPayment',
    width: 18,
    transform: (value) => buildReasonLabel(value as ReasonForPayment),
  },
  {
    header: 'CANTIDAD',
    key: 'quantity',
    width: 12,
    transform: (_value, row) => buildQuantity(row),
  },
  {
    header: 'IMPORTE',
    key: 'amount',
    width: 14,
    transform: () => '',
  },
  {
    header: 'OBSERVACIONES',
    key: 'observations',
    width: 42,
    transform: (_value, row) => buildObservations(row),
  },
  {
    header: 'FECHA',
    key: 'date',
    width: 14,
    transform: (_value, row) => formatDate(row.workDate),
  },
];

export const OVERTIME_EXCEL_REPORT: ExcelReportDefinition<Overtime> = {
  sheetName: 'Horas extra',
  columns: OVERTIME_EXCEL_COLUMNS,
  renderOptions: {
    headerColor: 'C00000',
    enableBorders: true,
    enableAutoFilter: true,
    enableAutoFit: true,
    maxColumnWidth: 60,
  },
  preRowsRenderOptions: {
    // PreRows se construyen con:
    // col 1: label (Empresa:/AREA:/PERIODO:)
    // col 2: value (empresa/periodo)
    // col 5: label (Fecha de elaboración/entrega)
    // col 6: value (fechas)
    labelColumns: [1, 5],
    valueColumns: [2, 6],
    labelFontColor: '000000',
    valueFontColor: 'C00000',
    labelBold: true,
    valueBold: true,
    underlineValue: true,
  },
};

export const OVERTIME_PDF_REPORT: PdfTableDefinition<Overtime> = {
  columns: [
    { header: 'NÓMINA', key: 'technician.user.employeeNumber', width: 50, transform: (v) => v || '' },
    {
      header: 'NOMBRE COMPLETO',
      key: 'technician.user',
      width: 110,
      transform: (_v, row) =>
        `${row.technician?.user?.firstName ?? ''} ${row.technician?.user?.lastName ?? ''}`.trim(),
    },
    { header: 'PUESTO', key: 'technician.position.name', width: 70, transform: (v) => v || '' },
    {
      header: 'CONCEPTO DE PAGO',
      key: 'reasonForPayment',
      width: 85,
      transform: (v) => buildReasonLabel(v as ReasonForPayment),
    },
    { header: 'CANTIDAD', key: 'quantity', width: 45, transform: (_v, row) => buildQuantity(row) },
    { header: 'IMPORTE', key: 'amount', width: 45, transform: () => '' },
    { header: 'OBSERVACIONES', key: 'observations', width: '*', transform: (_v, row) => buildObservations(row) },
    { header: 'FECHA', key: 'date', width: 55, transform: (_v, row) => formatDate(row.workDate) },
  ],
  renderOptions: {
    rowsPerBlock: 32,
    headerFontSize: 9,
    bodyFontSize: 8,
    rowPadding: 2,
    tableHeaderFillColor: '#C00000',
  },
};

