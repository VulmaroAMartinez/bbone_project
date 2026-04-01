/**
 * Pure logic for machine work orders GraphQL query.
 *
 */

export function getMachineWorkOrdersQueryField(): 'machine.workOrders' {
  return 'machine.workOrders';
}

export function extractMachineWorkOrders(
  data: { machine?: { workOrders?: unknown[] | null } | null } | null | undefined,
): unknown[] {
  return data?.machine?.workOrders ?? [];
}

export function extractWorkOrdersFiltered(
  data: { workOrdersFiltered?: { data?: unknown[] | null } | null } | null | undefined,
): unknown[] {
  return data?.workOrdersFiltered?.data ?? [];
}
