import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const ROLE_LABEL_ES: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  REQUESTER: 'Solicitante',
};

export function getRoleLabel(roleName: string | undefined | null): string {
  if (!roleName) return '';
  return ROLE_LABEL_ES[roleName] ?? roleName;
}

// Utilidad para calcular rangos de fecha
export function getDateRange(preset: '7d' | '30d' | 'this_month' | 'this_year'): { dateFrom: string; dateTo: string; preset: '7d' | '30d' | 'this_month' | 'this_year' } {
  const today = new Date();
  const dateTo = today.toISOString().split('T')[0];
  let dateFrom = '';

  switch (preset) {
    case '7d':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      break;
    case '30d':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      break;
    case 'this_month':
      // Día 1 del mes actual
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      dateFrom = firstDayOfMonth.toISOString().split('T')[0];
      break;
    case 'this_year':
      // Día 1 de Enero del año actual
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      dateFrom = firstDayOfYear.toISOString().split('T')[0];
      break;
  }

  return { dateFrom, dateTo, preset };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
