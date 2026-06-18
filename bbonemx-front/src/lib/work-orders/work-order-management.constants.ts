import type { MaintenanceType, StopType, WorkOrderPriority } from '@/lib/graphql/generated/graphql';
import type { WorkTypeValue } from '@/pages/admin/orders/modals/ManageWorkOrderDialog';

export const WORK_ORDER_MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'CORRECTIVE_EMERGENT', label: 'Correctivo Emergente' },
  { value: 'CORRECTIVE_SCHEDULED', label: 'Correctivo Programado' },
  { value: 'PREVENTIVE', label: 'Preventivo' },
  { value: 'FINDING', label: 'Hallazgo' },
];

export const WORK_ORDER_PRIORITIES: { value: WorkOrderPriority; label: string }[] = [
  { value: 'CRITICAL', label: 'Critica' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' },
];

export const WORK_ORDER_STOPPAGE_TYPES: { value: StopType; label: string }[] = [
  { value: 'BREAKDOWN', label: 'Avería' },
  { value: 'OTHER', label: 'Otro' },
];

export const WORK_ORDER_WORK_TYPES: { value: WorkTypeValue; label: string }[] = [
  { value: 'PAINTING', label: 'Pintura' },
  { value: 'PNEUMATIC', label: 'Neumática' },
  { value: 'ELECTRONIC', label: 'Electrónico' },
  { value: 'ELECTRICAL', label: 'Eléctrico' },
  { value: 'BUILDING', label: 'Edificio' },
  { value: 'METROLOGY', label: 'Metrología' },
  { value: 'AUTOMATION', label: 'Automatización' },
  { value: 'MECHANICAL', label: 'Mecánico' },
  { value: 'HYDRAULIC', label: 'Hidráulico' },
  { value: 'ELECTRICAL_CONTROL', label: 'Control eléctrico' },
  { value: 'OTHER', label: 'Otro' },
];

/** Grupos de turnos compatibles. Nombres en UPPERCASE para comparación consistente. */
const SHIFT_GROUPS: string[][] = [['TURNO 1', 'AVANZADA']];

export function getCompatibleShiftIds(
  selectedShiftId: string,
  shifts: Array<{ id: string; name: string }>,
): string[] {
  const selected = shifts.find((s) => s.id === selectedShiftId);
  if (!selected) return [];
  const upper = selected.name.toUpperCase();
  const group = SHIFT_GROUPS.find((g) => g.includes(upper));
  if (group) {
    return shifts.filter((s) => group.includes(s.name.toUpperCase())).map((s) => s.id);
  }
  return [selectedShiftId];
}
