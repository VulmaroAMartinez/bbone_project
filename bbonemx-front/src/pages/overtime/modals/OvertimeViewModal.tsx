import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { OvertimeRecord } from '../OvertimePage';
import { getReasonLabel, getReasonBadgeVariant, formatDate } from '../OvertimePage';

// ── Props ─────────────────────────────────────────────
interface OvertimeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: OvertimeRecord | null;
}

// ── Component ─────────────────────────────────────────
export function OvertimeViewModal({ open, onOpenChange, record }: OvertimeViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de Registro</DialogTitle>
          <DialogDescription>Informacion del registro de horas extra</DialogDescription>
        </DialogHeader>
        {record && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tecnico</p>
                <p className="text-sm font-medium">
                  {record.technician.user.firstName} {record.technician.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">No. Empleado</p>
                <p className="text-sm font-mono">{record.technician.user.employeeNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Puesto</p>
                <p className="text-sm">{record.technician.position?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-sm">{formatDate(record.workDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hora inicio</p>
                <p className="text-sm">{record.startTime.substring(0, 5)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hora fin</p>
                <p className="text-sm">{record.endTime.substring(0, 5)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horas trabajadas</p>
                <Badge variant="secondary" className="font-mono">
                  {record.workTime}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Razon de pago</p>
                <Badge variant={getReasonBadgeVariant(record.reasonForPayment)}>
                  {getReasonLabel(record.reasonForPayment)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actividad</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{record.activity}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
