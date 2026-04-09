/**
 * Parses a date string (ISO or YYYY-MM-DD) as a UTC calendar date,
 * avoiding timezone offset issues.
 */
function parseUTCDate(dateStr: string): Date {
  // Handle both "2026-04-09" and "2026-04-09T..."
  const [datePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Computes the difference in calendar days between two UTC dates.
 * Positive = a is after b, Negative = a is before b.
 */
function diffDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

/**
 * Returns a human-readable delivery status label based on estimated vs actual delivery dates.
 *
 * Rules:
 * - If estimatedDeliveryDate is null/undefined → returns null (no label to show)
 * - If deliveryDate is absent (not yet delivered):
 *   - days > 0  → "Faltan X días"
 *   - days = 0  → "Es hoy"
 *   - days < 0  → "Retrasado X días"
 * - If deliveryDate exists (already delivered):
 *   - delivered early  → "Entregado X días antes"
 *   - delivered on time → "Entregado a tiempo"
 *   - delivered late   → "Se retrasó X días"
 */
export function getDeliveryStatusLabel(
  estimatedDeliveryDate: string | null | undefined,
  deliveryDate: string | null | undefined,
): string | null {
  if (!estimatedDeliveryDate) return null;

  const estimated = parseUTCDate(estimatedDeliveryDate);

  if (!deliveryDate) {
    // Compare against today
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    const days = diffDays(estimated, todayUTC);

    if (days > 0) return `Faltan ${days} día${days === 1 ? '' : 's'}`;
    if (days === 0) return 'Es hoy';
    return `Retrasado ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`;
  }

  // Compare actual delivery against estimated
  const actual = parseUTCDate(deliveryDate);
  const days = diffDays(estimated, actual);

  if (days > 0)
    return `Entregado ${days} día${days === 1 ? '' : 's'} antes`;
  if (days === 0) return 'Entregado a tiempo';
  return `Se retrasó ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`;
}

/**
 * Returns a Tailwind CSS class string for coloring the delivery status label.
 */
export function getDeliveryStatusColor(
  estimatedDeliveryDate: string | null | undefined,
  deliveryDate: string | null | undefined,
): string {
  if (!estimatedDeliveryDate) return '';

  const estimated = parseUTCDate(estimatedDeliveryDate);

  if (!deliveryDate) {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    const days = diffDays(estimated, todayUTC);

    if (days > 1) return 'text-green-600';
    if (days >= 0) return 'text-yellow-600';
    return 'text-red-600';
  }

  const actual = parseUTCDate(deliveryDate);
  const days = diffDays(estimated, actual);

  if (days > 0) return 'text-green-600';
  if (days === 0) return 'text-blue-600';
  return 'text-red-600';
}
