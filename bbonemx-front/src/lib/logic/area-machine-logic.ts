/**
 * Pure logic for useAreaMachineSelector hook.
 */

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
