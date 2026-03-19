import { ValueTransformer } from 'typeorm';

export const dateColumnTransformer: ValueTransformer = {
  from(value: string | Date | null | undefined): Date | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value;

    const [y, m, d] = value.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  },

  to(value: Date | string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value;

    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },
};
