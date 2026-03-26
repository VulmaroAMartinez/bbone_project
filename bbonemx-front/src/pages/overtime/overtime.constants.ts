export interface OvertimeRecord {
  id: string;
  workDate: string;
  startTime: string;
  endTime: string;
  workTime: string;
  activity: string;
  reasonForPayment: string | null;
  technicianId: string;
  technician: {
    id: string;
    user: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
    };
    position: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

export interface TechnicianOption {
  id: string;
  user: {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
  };
  position: {
    id: string;
    name: string;
  };
}

export const REASON_FOR_PAYMENT_OPTIONS = [
  { value: 'HOLIDAY', label: 'Dia festivo' },
  { value: 'WORK_BREAK', label: 'Descanso laboral' },
  { value: 'OVERTIME', label: 'Tiempo extra' },
] as const;

export function getReasonLabel(reason: string | null) {
  if (!reason) return '—';
  return (
    REASON_FOR_PAYMENT_OPTIONS.find((o) => o.value === reason)?.label ?? reason
  );
}

export function getReasonBadgeVariant(
  reason: string | null,
): 'default' | 'secondary' | 'outline' {
  if (!reason) return 'outline';
  switch (reason) {
    case 'HOLIDAY':
      return 'default';
    case 'WORK_BREAK':
      return 'secondary';
    case 'OVERTIME':
      return 'default';
    default:
      return 'outline';
  }
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

