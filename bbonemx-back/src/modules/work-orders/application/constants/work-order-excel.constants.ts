import type {
  ExcelColumnDefinition,
  ExcelReportDefinition,
} from 'src/infrastructure/excel';
import {
  MaintenanceType,
  StopType,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkType,
} from 'src/common/enums';
import { WorkOrder } from '../../domain/entities';
import { WorkOrderTechnician } from '../../domain/entities';

export type WorkOrderExcelRow = WorkOrder & {
  _technicians?: WorkOrderTechnician[];
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]: 'Pendiente',
  [WorkOrderStatus.IN_PROGRESS]: 'En Progreso',
  [WorkOrderStatus.FINISHED]: 'Finalizada',
  [WorkOrderStatus.COMPLETED]: 'Completada',
  [WorkOrderStatus.TEMPORARY_REPAIR]: 'Reparación Temporal',
  [WorkOrderStatus.PAUSED]: 'Pausada',
  [WorkOrderStatus.CANCELLED]: 'Cancelada',
};

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.CRITICAL]: 'Crítica',
  [WorkOrderPriority.HIGH]: 'Alta',
  [WorkOrderPriority.MEDIUM]: 'Media',
  [WorkOrderPriority.LOW]: 'Baja',
};

const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  [MaintenanceType.CORRECTIVE_EMERGENT]: 'Correctivo emergente',
  [MaintenanceType.PREVENTIVE]: 'Preventivo',
  [MaintenanceType.FINDING]: 'Hallazgo',
  [MaintenanceType.CORRECTIVE_SCHEDULED]: 'Correctivo programado',
};

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.PAINTING]: 'Pintura',
  [WorkType.PNEUMATIC]: 'Neumática',
  [WorkType.ELECTRONIC]: 'Electrónico',
  [WorkType.ELECTRICAL]: 'Eléctrico',
  [WorkType.BUILDING]: 'Edificio',
  [WorkType.METROLOGY]: 'Metrología',
  [WorkType.AUTOMATION]: 'Automatización',
  [WorkType.MECHANICAL]: 'Mecánico',
  [WorkType.HYDRAULIC]: 'Hidráulico',
  [WorkType.ELECTRICAL_CONTROL]: 'Control eléctrico',
  [WorkType.OTHER]: 'Otro',
};

const STOP_TYPE_LABELS: Record<StopType, string> = {
  [StopType.BREAKDOWN]: 'Avería',
  [StopType.OTHER]: 'Otro',
};

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTechnicianName(
  tech?: WorkOrderTechnician['technician'],
): string {
  if (!tech) return '';
  return (
    tech.fullName || `${tech.firstName ?? ''} ${tech.lastName ?? ''}`.trim()
  );
}

function formatTechniciansList(row: WorkOrderExcelRow): string {
  const techs = row._technicians ?? [];
  if (!techs.length) return '';
  return techs
    .map((t) => formatTechnicianName(t.technician))
    .filter(Boolean)
    .join(', ');
}

function formatLeadTechnician(row: WorkOrderExcelRow): string {
  const lead = row._technicians?.find((t) => t.isLead);
  return lead ? formatTechnicianName(lead.technician) : '';
}

function formatMachine(row: WorkOrderExcelRow): string {
  const name = row.machine?.name ?? '';
  const code = row.machine?.code ?? '';
  if (name && code) return `${name} (${code})`;
  return name || code || '';
}

function formatFunctionalMinutes(row: WorkOrderExcelRow): string {
  const minutes = row.getFunctionalTimeMinutes?.() ?? row.functionalTimeMinutes;
  if (minutes == null) return '';
  return String(minutes);
}

export const WORK_ORDER_EXCEL_COLUMNS: ExcelColumnDefinition<WorkOrderExcelRow>[] =
  [
    { header: 'Folio', key: 'folio', width: 16 },
    {
      header: 'Estado',
      key: 'status',
      width: 16,
      transform: (value) =>
        STATUS_LABELS[value as WorkOrderStatus] ?? String(value ?? ''),
    },
    {
      header: 'Prioridad',
      key: 'priority',
      width: 12,
      transform: (value) =>
        value
          ? (PRIORITY_LABELS[value as WorkOrderPriority] ?? String(value))
          : '',
    },
    {
      header: 'Tipo mantenimiento',
      key: 'maintenanceType',
      width: 22,
      transform: (value) =>
        value
          ? (MAINTENANCE_TYPE_LABELS[value as MaintenanceType] ?? String(value))
          : '',
    },
    {
      header: 'Tipo trabajo',
      key: 'workType',
      width: 16,
      transform: (value) =>
        value ? (WORK_TYPE_LABELS[value as WorkType] ?? String(value)) : '',
    },
    {
      header: 'Tipo paro',
      key: 'stopType',
      width: 12,
      transform: (value) =>
        value ? (STOP_TYPE_LABELS[value as StopType] ?? String(value)) : '',
    },
    { header: 'Área', key: 'area.name', width: 20 },
    { header: 'Subárea', key: 'subArea.name', width: 20 },
    {
      header: 'Equipo',
      key: 'machine',
      width: 24,
      transform: (_value, row) => formatMachine(row),
    },
    { header: 'Turno', key: 'assignedShift.name', width: 14 },
    {
      header: 'Solicitante',
      key: 'requester',
      width: 24,
      transform: (_value, row) =>
        row.requester?.fullName ??
        `${row.requester?.firstName ?? ''} ${row.requester?.lastName ?? ''}`.trim(),
    },
    {
      header: 'Técnico líder',
      key: 'leadTechnician',
      width: 24,
      transform: (_value, row) => formatLeadTechnician(row),
    },
    {
      header: 'Técnicos',
      key: 'technicians',
      width: 30,
      transform: (_value, row) => formatTechniciansList(row),
    },
    {
      header: 'F. creación',
      key: 'createdAt',
      width: 18,
      transform: (value) => formatDateTime(value as Date),
    },
    {
      header: 'F. programada',
      key: 'scheduledDate',
      width: 18,
      transform: (value) => formatDateTime(value as Date),
    },
    {
      header: 'F. inicio',
      key: 'startDate',
      width: 18,
      transform: (value) => formatDateTime(value as Date),
    },
    {
      header: 'F. fin',
      key: 'endDate',
      width: 18,
      transform: (value) => formatDateTime(value as Date),
    },
    { header: 'Descripción', key: 'description', width: 36 },
    {
      header: 'Descripción avería',
      key: 'breakdownDescription',
      width: 30,
      transform: (value) => String(value ?? ''),
    },
    {
      header: 'Causa',
      key: 'cause',
      width: 24,
      transform: (value) => String(value ?? ''),
    },
    {
      header: 'Acción tomada',
      key: 'actionTaken',
      width: 24,
      transform: (value) => String(value ?? ''),
    },
    {
      header: 'Herramientas',
      key: 'toolsUsed',
      width: 24,
      transform: (value) => String(value ?? ''),
    },
    {
      header: 'Observaciones',
      key: 'observations',
      width: 30,
      transform: (value) => String(value ?? ''),
    },
    {
      header: 'Tiempo paro (min)',
      key: 'downtimeMinutes',
      width: 16,
      transform: (value) => (value == null ? '' : String(value)),
    },
    {
      header: 'Tiempo funcional (min)',
      key: 'functionalTimeMinutes',
      width: 20,
      transform: (_value, row) => formatFunctionalMinutes(row),
    },
  ];

export const WORK_ORDER_EXCEL_REPORT: ExcelReportDefinition<WorkOrderExcelRow> =
  {
    sheetName: 'Órdenes de trabajo',
    columns: WORK_ORDER_EXCEL_COLUMNS,
    renderOptions: {
      headerColor: '1F4E79',
      enableBorders: true,
      enableAutoFilter: true,
      enableAutoFit: true,
      maxColumnWidth: 60,
    },
  };
