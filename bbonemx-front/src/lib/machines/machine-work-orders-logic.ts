/**
 * Pure logic for machine work orders GraphQL query.
 *
 * Bug 6: The original GET_MACHINE_WORK_ORDERS query used
 * `workOrdersFiltered(filters: { search: $id })` which treats the UUID as a
 * free-text search against folio/description — never matching anything.
 *
 * The correct approach is to use the `machine(id: $id) { workOrders { ... } }`
 * resolver which returns work orders properly associated with the machine.
 */

/**
 * Returns the correct GraphQL field path for fetching machine work orders.
 *
 * The legacy path ("workOrdersFiltered") is WRONG because it performs a
 * full-text search against folio/description using the machine UUID, which
 * yields empty results.
 *
 * The correct path ("machine.workOrders") uses the dedicated resolver field.
 */
export function getMachineWorkOrdersQueryField(): 'machine.workOrders' {
  return 'machine.workOrders';
}

/**
 * Extracts work orders from the raw GraphQL response produced by
 * `machine(id: $id) { workOrders { ... } }`.
 *
 * Returns an empty array when the response is null/undefined or the machine
 * has no work orders.
 */
export function extractMachineWorkOrders(
  data: { machine?: { workOrders?: unknown[] | null } | null } | null | undefined,
): unknown[] {
  return data?.machine?.workOrders ?? [];
}

/**
 * Extracts work orders from the LEGACY (broken) response shape produced by
 * `workOrdersFiltered(filters: { search: $id })`.
 *
 * Always returns empty results because the UUID never matches a folio or
 * description.  This function documents the broken behaviour for test
 * comparison purposes.
 */
export function extractWorkOrdersFiltered(
  data: { workOrdersFiltered?: { data?: unknown[] | null } | null } | null | undefined,
): unknown[] {
  return data?.workOrdersFiltered?.data ?? [];
}
