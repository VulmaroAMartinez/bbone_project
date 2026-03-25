import type { ExcelColumnDefinition, ExcelReportDefinition } from 'src/infrastructure/excel';
import { Activity } from '../../domain/entities';
import { ActivityStatus } from 'src/common/enums';

const STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.PENDING]: 'Pendiente',
  [ActivityStatus.IN_PROGRESS]: 'En progreso',
  [ActivityStatus.COMPLETED]: 'Realizado',
};

function formatDate(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX');
}

function formatDateTime(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-MX');
}

export const ACTIVITY_EXCEL_COLUMNS: ExcelColumnDefinition<Activity>[] = [
  { header: 'Actividad', key: 'activity', width: 30 },
  { header: 'Área', key: 'area.name', width: 20 },
  { header: 'Máquina', key: 'machine.name', width: 20 },
  {
    header: 'Estado',
    key: 'status',
    width: 15,
    transform: (value) => STATUS_LABELS[value as ActivityStatus] || value || '',
  },
  { header: 'Progreso (%)', key: 'progress', width: 14 },
  {
    header: 'Prioridad',
    key: 'priority',
    width: 12,
    transform: (value) => (value ? 'Sí' : 'No'),
  },
  {
    header: 'Fecha Inicio',
    key: 'startDate',
    width: 15,
    transform: (value) => formatDate(value),
  },
  {
    header: 'Fecha Fin',
    key: 'endDate',
    width: 15,
    transform: (value) => formatDate(value),
  },
  {
    header: 'Técnicos',
    key: 'activityTechnicians',
    width: 30,
    transform: (_value, row) => {
      const techs = row.activityTechnicians;
      if (!techs || !Array.isArray(techs)) return '';
      return techs
        .filter((at) => at.isActive && at.technician)
        .map((at) => `${at.technician.firstName} ${at.technician.lastName}`)
        .join(', ');
    },
  },
  {
    header: 'Comentarios',
    key: 'comments',
    width: 30,
    transform: (value) => value || '',
  },
  {
    header: 'Creado',
    key: 'createdAt',
    width: 18,
    transform: (value) => formatDateTime(value),
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
