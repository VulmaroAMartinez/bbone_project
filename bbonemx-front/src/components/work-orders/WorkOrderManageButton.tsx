import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { ManageWorkOrderDialog } from '@/pages/admin/orders/modals/ManageWorkOrderDialog';
import {
  WORK_ORDER_MAINTENANCE_TYPES,
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STOPPAGE_TYPES,
  WORK_ORDER_WORK_TYPES,
} from '@/lib/work-orders/work-order-management.constants';

type WorkOrderManageButtonProps = {
  workOrderId: string;
  workOrder?: Record<string, unknown> | null;
  onUpdated?: () => void | Promise<void>;
  className?: string;
};

export function WorkOrderManageButton({
  workOrderId,
  workOrder,
  onUpdated,
  className,
}: WorkOrderManageButtonProps) {
  const mgmtActions = useWorkOrderManagement({
    workOrderId,
    workOrder,
    onUpdated,
  });

  if (!mgmtActions.canShowButton) return null;

  return (
    <>
      <Button onClick={mgmtActions.openManageDialog} className={`gap-2 shadow-sm ${className ?? ''}`}>
        <Settings className="h-4 w-4" />
        Gestionar OT {mgmtActions.isPending ? 'y Asignar' : ''}
      </Button>

      <ManageWorkOrderDialog
        open={mgmtActions.manageOpen}
        onOpenChange={mgmtActions.setManageOpen}
        showMachineField={mgmtActions.showMachineField}
        showScheduledDate={mgmtActions.showScheduledDate}
        isPending={mgmtActions.isPending}
        isProcessing={mgmtActions.isProcessing}
        mgmt={mgmtActions.mgmt}
        setMgmt={mgmtActions.setMgmt}
        auxiliaryTechnicians={mgmtActions.auxiliaryTechnicians}
        setAuxiliaryTechnicians={mgmtActions.setAuxiliaryTechnicians}
        machineOptions={mgmtActions.machineOptions}
        techOptions={mgmtActions.techOptions}
        shifts={mgmtActions.shifts}
        priorities={WORK_ORDER_PRIORITIES}
        stoppageTypes={WORK_ORDER_STOPPAGE_TYPES}
        maintenanceTypes={WORK_ORDER_MAINTENANCE_TYPES}
        workTypes={WORK_ORDER_WORK_TYPES}
        disableBreakdown={!mgmtActions.areaHasMachines}
        breakdownDisabledHint="sin equipos en el área"
        onSave={mgmtActions.handleSaveManagement}
      />
    </>
  );
}
