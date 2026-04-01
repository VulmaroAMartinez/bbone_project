export const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipo',
  MATERIAL_WITH_SKU: 'Material con SKU',
  NON_INVENTORY_MATERIAL: 'Material no inventariado',
  NON_INVENTORY_SPARE_PART: 'Refacción no inventariada',
  PPE: 'Protección personal',
  REQUEST_SKU_MATERIAL: 'Solicitud SKU Material',
  REQUEST_SKU_SPARE_PART: 'Solicitud SKU Refacción',
  SERVICE: 'Servicio',
  SERVICE_WITH_MATERIAL: 'Servicio con material',
  SPARE_PART_WITH_SKU: 'Refacción con SKU',
  TOOLS: 'Herramientas',
  UPDATE_SKU: 'Actualización de SKU',
};

export const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgente',
  SCHEDULED: 'Programada',
};

export const IMPORTANCE_LABELS: Record<string, string> = {
  VERY_IMPORTANT: 'Muy importante',
  IMPORTANT: 'Importante',
  UNIMPORTANT: 'Poco importante',
};

export const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const IMPORTANCE_COLORS: Record<string, string> = {
  VERY_IMPORTANT: 'bg-orange-100 text-orange-700 border-orange-200',
  IMPORTANT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  UNIMPORTANT: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
