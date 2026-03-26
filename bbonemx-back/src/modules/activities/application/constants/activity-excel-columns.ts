import type {
  ExcelColumnDefinition,
  ExcelReportDefinition,
} from 'src/infrastructure/excel';
import type { PdfTableDefinition } from 'src/infrastructure/pdf';
import { Activity } from '../../domain/entities';
import { ActivityStatus } from 'src/common/enums';

const STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.PENDING]: 'Pendiente',
  [ActivityStatus.IN_PROGRESS]: 'En progreso',
  [ActivityStatus.COMPLETED]: 'Realizado',
};

function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const ACTIVITY_EXCEL_COLUMNS: ExcelColumnDefinition<Activity>[] = [
  { header: 'Área', key: 'area.name', width: 20 },
  { header: 'Equipo', key: 'machine.name', width: 20 },
  { header: 'Actividad', key: 'activity', width: 30 },
  {
    header: 'Responsables',
    key: 'activityTechnicians',
    width: 30,
    transform: (_value, row) => {
      const techs = row.activityTechnicians;
      if (!techs || !Array.isArray(techs) || techs.length === 0) return '-';

      const names = techs
        .filter((at) => at.isActive && at.technician)
        .map((at) => {
          const t = at.technician;
          return t.fullName || `${t.firstName} ${t.lastName}`;
        });

      return names.length > 0 ? names.join(', ') : '-';
    },
  },
  {
    header: 'F. Inicio',
    key: 'startDate',
    width: 15,
    transform: (value: unknown) =>
      formatDate(value as string | number | Date | null | undefined),
  },
  {
    header: 'F. Fin',
    key: 'endDate',
    width: 15,
    transform: (value: unknown) =>
      formatDate(value as string | number | Date | null | undefined),
  },
  {
    header: 'Estatus',
    key: 'status',
    width: 15,
    transform: (value: unknown) =>
      STATUS_LABELS[value as ActivityStatus] ?? (value as string) ?? '',
  },
  {
    header: 'Avance',
    key: 'progress',
    width: 12,
    transform: (value: unknown) =>
      value == null ? '-' : `${value as number}%`,
  },
  {
    header: 'Comentarios',
    key: 'comments',
    width: 30,
    transform: (value: unknown) => (value as string) || '-',
  },
  {
    header: 'Prioridad',
    key: 'priority',
    width: 12,
    transform: (value: unknown) => (value ? 'Sí' : 'No'),
  },
];

export const ACTIVITY_EXCEL_REPORT: ExcelReportDefinition<Activity> = {
  sheetName: 'Actividades',
  columns: ACTIVITY_EXCEL_COLUMNS,
  renderOptions: {
    // Mantener consistencia con el estilo actual (el stream ignorará auto-fit).
    headerColor: '1F4E79',
    enableBorders: true,
    enableAutoFilter: true,
    enableAutoFit: true,
    maxColumnWidth: 50,
  },
};

export const ACTIVITY_PDF_REPORT: PdfTableDefinition<Activity> = {
  columns: [
    { header: 'Área', key: 'area.name', width: 70 },
    { header: 'Equipo', key: 'machine.name', width: 70 },
    { header: 'Actividad', key: 'activity', width: '*' },
    {
      header: 'Responsables',
      key: 'activityTechnicians',
      width: 110,
      transform: (_value, row) => {
        const techs = row.activityTechnicians;
        if (!techs || !Array.isArray(techs) || techs.length === 0) return '-';
        const names = techs
          .filter((at) => at.isActive && at.technician)
          .map((at) => {
            const t = at.technician;
            return t.fullName || `${t.firstName} ${t.lastName}`;
          });
        return names.length > 0 ? names.join(', ') : '-';
      },
    },
    {
      header: 'F. Inicio',
      key: 'startDate',
      width: 55,
      transform: (v) =>
        formatDate(v as string | number | Date | null | undefined),
    },
    {
      header: 'F. Fin',
      key: 'endDate',
      width: 55,
      transform: (v) =>
        formatDate(v as string | number | Date | null | undefined),
    },
    {
      header: 'Estatus',
      key: 'status',
      width: 60,
      transform: (v) => STATUS_LABELS[v as ActivityStatus] ?? v ?? '',
    },
    {
      header: 'Avance',
      key: 'progress',
      width: 40,
      transform: (v: unknown) => (v == null ? '-' : `${v as number}%`),
    },
    {
      header: 'Comentarios',
      key: 'comments',
      width: 110,
      transform: (v) => (v as string) || '-',
    },
    {
      header: 'Prioridad',
      key: 'priority',
      width: 55,
      transform: (v) => (v ? 'Sí' : 'No'),
    },
  ],
  renderOptions: {
    title: 'Actividades',
    // Evitar saturación visual en PDF
    rowsPerBlock: 35,
    headerFontSize: 9,
    bodyFontSize: 8,
    rowPadding: 2,
  },
};
