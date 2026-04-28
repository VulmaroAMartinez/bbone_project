import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'bbm:filters:';

export function usePersistentFilters<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
): [T, (patch: Partial<T>) => void, () => void, boolean] {
  const storageKey = PREFIX + key;

  const [filters, setFilters] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) return { ...defaults, ...JSON.parse(stored) } as T;
    } catch {
      // ignore
    }
    return defaults;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters, storageKey]);

  const updateFilter = useCallback(
    (patch: Partial<T>) => setFilters((prev) => ({ ...prev, ...patch })),
    [],
  );

  const clearFilters = useCallback(() => setFilters(defaults), [defaults]);

  const hasActiveFilters = Object.keys(defaults).some(
    (k) => JSON.stringify(filters[k]) !== JSON.stringify((defaults as Record<string, unknown>)[k]),
  );

  return [filters, updateFilter, clearFilters, hasActiveFilters];
}
