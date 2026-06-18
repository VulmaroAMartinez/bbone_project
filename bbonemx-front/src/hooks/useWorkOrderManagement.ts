import { useState, useEffect, useCallback, useMemo, type SetStateAction } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import {
  GetTechniciansDocument,
  GetShiftsDocument,
  GetMachinesPageDataDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  TechnicianBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';
import {
  GET_WORK_ORDER_BY_ID_QUERY,
  UPDATE_WORK_ORDER_MUTATION,
  ASSIGN_WORK_ORDER_MUTATION,
} from '@/lib/graphql/operations/work-orders';
import { GET_TECH_IDS_FOR_SHIFT_QUERY } from '@/lib/graphql/operations/scheduling';
import { getCompatibleShiftIds } from '@/lib/work-orders/work-order-management.constants';
import type { MgmtState, WorkTypeValue } from '@/pages/admin/orders/modals/ManageWorkOrderDialog';

type WorkOrderSource = Record<string, unknown> | null | undefined;

type UseWorkOrderManagementOptions = {
  workOrderId: string;
  /** Si ya se cargó la OT en el padre, evita un fetch duplicado. */
  workOrder?: WorkOrderSource;
  onUpdated?: () => void | Promise<void>;
};

export function useWorkOrderManagement({
  workOrderId,
  workOrder: externalWorkOrder,
  onUpdated,
}: UseWorkOrderManagementOptions) {
  const { isAdmin, isBoss } = useAuth();
  const canManageWorkOrder = isAdmin || isBoss;
  const apolloClient = useApolloClient();

  const [manageOpen, setManageOpen] = useState(false);
  const [auxiliaryTechnicians, setAuxiliaryTechnicians] = useState<string[]>([]);
  const [filteredTechIds, setFilteredTechIds] = useState<Set<string> | null>(null);
  const [mgmt, setMgmt] = useState<MgmtState>({
    priority: undefined,
    stoppageType: undefined,
    shiftId: '',
    maintenanceType: undefined,
    scheduledDate: '',
    workType: undefined,
    machineId: '',
    leadTechnicianId: '',
  });

  const { data, refetch } = useQuery(GET_WORK_ORDER_BY_ID_QUERY, {
    variables: { id: workOrderId },
    skip: !workOrderId || !!externalWorkOrder,
  });

  const { data: techData } = useQuery(GetTechniciansDocument);
  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const [getMachines, { data: machinesData }] = useLazyQuery(GetMachinesPageDataDocument);

  const [updateOrder, { loading: updating }] = useMutation(UPDATE_WORK_ORDER_MUTATION);
  const [assignOrder, { loading: assigning }] = useMutation(ASSIGN_WORK_ORDER_MUTATION);

  const workOrderRaw = externalWorkOrder ?? (data as { workOrder?: WorkOrderSource })?.workOrder;
  const order = unmaskFragment(WorkOrderItemFragmentDoc, workOrderRaw);

  const area = unmaskFragment(AreaBasicFragmentDoc, order?.area);
  const subArea = unmaskFragment(SubAreaBasicFragmentDoc, order?.subArea);

  const leadTechRel = order?.technicians?.find((t) => t.isLead);
  const shifts = useMemo(() => shiftsData?.shiftsActive || [], [shiftsData?.shiftsActive]);
  const technicians = unmaskFragment(TechnicianBasicFragmentDoc, techData?.techniciansActive || []);
  const machinesRaw = machinesData?.machinesWithDeleted ?? [];

  const machinesAll = machinesRaw.map((ref) => unmaskFragment(MachineBasicFragmentDoc, ref));
  const effectiveAreaId = area?.id ?? '';

  const machinesInArea = effectiveAreaId
    ? machinesAll.filter((m) => m.areaId === effectiveAreaId || m.subArea?.area?.id === effectiveAreaId)
    : machinesAll;

  const machinesInSubArea = subArea?.id
    ? machinesAll.filter((m) => m.subAreaId === subArea.id)
    : [];

  const availableMachines = machinesInSubArea.length > 0 ? machinesInSubArea : machinesInArea;
  const areaHasMachines = machinesInArea.length > 0;

  const allTechOptions = technicians.map((tech) => {
    const tUser = unmaskFragment(UserBasicFragmentDoc, tech.user);
    return { value: tUser.id, label: tUser.fullName };
  });

  const techOptions = filteredTechIds
    ? allTechOptions.filter((o) => filteredTechIds.has(o.value))
    : allTechOptions;

  const machineOptions = availableMachines.map((m) => ({
    value: m.id,
    label: `${m.name} [${m.code}]`,
  }));

  const fetchCompatibleTechIds = useCallback(
    async (shiftId: string, scheduleDate: string) => {
      const compatibleIds = getCompatibleShiftIds(shiftId, shifts);
      type ShiftScheduleResult = { technicianSchedulesFiltered: Array<{ technicianId: string }> };
      const results = await Promise.all(
        compatibleIds.map((sid) =>
          apolloClient.query<ShiftScheduleResult>({
            query: GET_TECH_IDS_FOR_SHIFT_QUERY,
            variables: { filters: { shiftId: sid, scheduleDate, onlyWorkDays: true } },
            fetchPolicy: 'network-only',
          }),
        ),
      );
      const ids = new Set<string>();
      for (const r of results) {
        for (const s of r.data?.technicianSchedulesFiltered ?? []) {
          ids.add(s.technicianId);
        }
      }
      setFilteredTechIds(ids);
    },
    [apolloClient, shifts],
  );

  useEffect(() => {
    if (!mgmt.shiftId) {
      setFilteredTechIds(null);
      return;
    }
    const date = mgmt.scheduledDate || new Date().toISOString().split('T')[0];
    fetchCompatibleTechIds(mgmt.shiftId, date);
  }, [mgmt.shiftId, mgmt.scheduledDate, fetchCompatibleTechIds]);

  useEffect(() => {
    if (manageOpen && area?.id) {
      getMachines();
    }
  }, [area?.id, manageOpen, getMachines]);

  const openManageDialog = () => {
    if (order) {
      const auxTechs =
        order.technicians
          ?.filter((t) => !t.isLead)
          .map((t) => unmaskFragment(UserBasicFragmentDoc, t.technician)?.id || '') || [];

      setMgmt({
        priority: order.priority || undefined,
        stoppageType: order.stopType || undefined,
        shiftId: order.assignedShiftId || '',
        maintenanceType: order.maintenanceType || undefined,
        scheduledDate: (order as unknown as { scheduledDate?: string })?.scheduledDate
          ? new Date((order as unknown as { scheduledDate: string }).scheduledDate)
              .toISOString()
              .split('T')[0]
          : '',
        workType: (order as unknown as { workType?: WorkTypeValue })?.workType || undefined,
        machineId: order.machineId || '',
        leadTechnicianId:
          unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician)?.id || '',
      });
      setAuxiliaryTechnicians(auxTechs);
    }
    setManageOpen(true);
  };

  const handleSaveManagement = async () => {
    if (!order) return;

    try {
      if (order.status === 'PENDING' || order.status === 'TEMPORARY_REPAIR') {
        if (!mgmt.leadTechnicianId) {
          throw new Error('Debe seleccionar un Técnico Líder para asignar la orden.');
        }

        if (!mgmt.workType) {
          throw new Error('Debe seleccionar el tipo de trabajo.');
        }

        if (mgmt.maintenanceType === 'CORRECTIVE_SCHEDULED' && !mgmt.scheduledDate) {
          throw new Error('La fecha programada es obligatoria para correctivo programado.');
        }

        const cleanAuxTechnicians = auxiliaryTechnicians.filter((tId) => tId !== '');
        const allTechnicianIds = Array.from(
          new Set([mgmt.leadTechnicianId, ...cleanAuxTechnicians]),
        ).filter(Boolean);

        await assignOrder({
          variables: {
            id: order.id,
            input: {
              priority: mgmt.priority!,
              maintenanceType: mgmt.maintenanceType!,
              stopType: mgmt.stoppageType!,
              assignedShiftId: mgmt.shiftId || undefined,
              leadTechnicianId: mgmt.leadTechnicianId,
              technicianIds: allTechnicianIds,
              machineId: mgmt.machineId || undefined,
              scheduledDate: mgmt.scheduledDate || undefined,
              workType: mgmt.workType,
            },
          },
        });
      } else {
        await updateOrder({
          variables: {
            id: order.id,
            input: {
              priority: mgmt.priority,
              stopType: mgmt.stoppageType,
              assignedShiftId: mgmt.shiftId || undefined,
              maintenanceType: mgmt.maintenanceType,
              machineId: mgmt.machineId || undefined,
              scheduledDate: mgmt.scheduledDate || undefined,
              workType: mgmt.workType,
            },
          },
        });
      }

      setManageOpen(false);
      if (externalWorkOrder) {
        await onUpdated?.();
      } else {
        await refetch();
        await onUpdated?.();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar la orden');
    }
  };

  const isPending = order?.status === 'PENDING';
  const isCompleted = order?.status === 'COMPLETED';
  const isCancelled = order?.status === 'CANCELLED';
  const showMachineField = mgmt.stoppageType === 'BREAKDOWN' || !!subArea?.id;
  const showScheduledDate = mgmt.maintenanceType === 'CORRECTIVE_SCHEDULED';
  const isProcessing = updating || assigning;
  const canShowButton =
    canManageWorkOrder && !!order && !isCompleted && !isCancelled;

  return {
    canShowButton,
    manageOpen,
    setManageOpen,
    openManageDialog,
    handleSaveManagement,
    mgmt,
    setMgmt: (updater: SetStateAction<MgmtState>) => {
      setMgmt((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next.shiftId !== prev.shiftId) {
          setAuxiliaryTechnicians([]);
          return { ...next, leadTechnicianId: '' };
        }
        return next;
      });
    },
    auxiliaryTechnicians,
    setAuxiliaryTechnicians,
    machineOptions,
    techOptions,
    shifts,
    showMachineField,
    showScheduledDate,
    isPending: !!isPending,
    isProcessing,
    areaHasMachines,
  };
}
