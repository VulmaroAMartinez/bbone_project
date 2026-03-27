/**
 * Pure logic for useAreaMachineSelector hook.
 *
 * areaHasMachines tracks whether the AREA (not a filtered sub-area view) has
 * machines.  It must be set once on handleAreaChange and NEVER mutated when
 * the user picks a sub-area.  Consumers use it to:
 *   1. decide whether to render the machine field
 *   2. decide whether to enable the "Avería" (BREAKDOWN) stoppage type
 */

/** Returns true when the area-level machine list is non-empty. */
export function deriveAreaHasMachines(areaMachineCount: number): boolean {
  return areaMachineCount > 0;
}

/**
 * Determines whether the machine field should be shown to the user.
 *
 * The field is shown when:
 *  - an area has been selected
 *  - AND that area has machines at the area level (not filtered by sub-area)
 */
export function shouldShowMachineField(areaId: string, areaHasMachines: boolean): boolean {
  return !!areaId && areaHasMachines;
}

/**
 * Determines whether the "Avería / BREAKDOWN" stoppage option should be
 * enabled.
 *
 * Avería requires a machine to be associated, so it is only available when
 * the area has machines.
 */
export function isAveriaEnabled(areaHasMachines: boolean): boolean {
  return areaHasMachines;
}
