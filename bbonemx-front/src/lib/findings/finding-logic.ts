/**
 * Pure logic for finding feedback business rules.
 */

/**
 * Returns true when a finding is editable.
 *
 * A finding that has already been converted to a work order (OT) must be
 * read-only — the form fields and submit button must all be disabled.
 */
export function canEditFinding(convertedToWo: { folio: string } | null | undefined): boolean {
  return !convertedToWo;
}

/**
 * Filters a machine list to only those belonging to the selected area.
 *
 * A machine belongs to the area when:
 *   - machine.area.id === areaId, OR
 *   - machine.subArea.area.id === areaId
 *
 * When areaId is empty the full list is returned (no filter applied).
 */
export function filterMachinesByArea<
  T extends {
    id: string;
    area?: { id: string; name: string } | null;
    subArea?: { id: string; name: string; area?: { id: string; name: string } | null } | null;
  },
>(machines: T[], areaId: string): T[] {
  if (!areaId) return machines;
  return machines.filter(
    (m) => m.area?.id === areaId || m.subArea?.area?.id === areaId,
  );
}

/**
 * Builds a display label for a machine that includes its sub-area path.
 *
 * Format: "MachineName [CODE] — SubAreaName" when in a sub-area,
 *         "MachineName [CODE]" otherwise.
 */
export function buildMachineLabel(machine: {
  name: string;
  code?: string | null;
  subArea?: { name: string } | null;
}): string {
  const base = `${machine.name} [${machine.code ?? ''}]`;
  if (machine.subArea?.name) {
    return `${base} — ${machine.subArea.name}`;
  }
  return base;
}
