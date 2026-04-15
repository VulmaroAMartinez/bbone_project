import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  BatchScheduleWorkOrdersDocument,
  GetWorkOrdersFilteredDocument,
} from '@/lib/graphql/generated/graphql';
import { GET_SCHEDULED_WORK_ORDERS_QUERY } from '@/lib/graphql/operations/work-orders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CalendarDays, Loader2 } from 'lucide-react';

interface ScheduleOrdersModalProps {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleOrdersModal({ open, selectedIds, onClose, onSuccess }: ScheduleOrdersModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [dateError, setDateError] = useState('');

  const [batchSchedule, { loading }] = useMutation(BatchScheduleWorkOrdersDocument, {
    refetchQueries: [
      { query: GetWorkOrdersFilteredDocument },
      { query: GET_SCHEDULED_WORK_ORDERS_QUERY },
    ],
  });

  function handleClose() {
    if (loading) return;
    setScheduledDate('');
    setDateError('');
    onClose();
  }

  function validate(): boolean {
    if (!scheduledDate) {
      setDateError('La fecha de programación es obligatoria');
      return false;
    }
    setDateError('');
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;

    try {
      await batchSchedule({
        variables: {
          input: {
            ids: selectedIds,
            scheduledDate,
          },
        },
      });

      const count = selectedIds.length;
      toast.success(
        count === 1
          ? 'Orden programada correctamente'
          : `${count} órdenes programadas correctamente`,
      );
      setScheduledDate('');
      setDateError('');
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al programar las órdenes';
      toast.error(message);
    }
  }

  const count = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Programar órdenes correctivas
          </DialogTitle>
          <DialogDescription>
            {count === 1
              ? 'Se convertirá 1 orden a correctivo programado con la fecha que selecciones.'
              : `Se convertirán ${count} órdenes a correctivo programado con la fecha que selecciones.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="schedule-date">
              Fecha de programación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="schedule-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                if (e.target.value) setDateError('');
              }}
              className={dateError ? 'border-destructive' : ''}
            />
            {dateError && (
              <p className="text-sm text-destructive">{dateError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Programando...' : 'Confirmar y programar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
