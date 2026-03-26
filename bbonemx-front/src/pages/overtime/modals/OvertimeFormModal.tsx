import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';

import {
  CREATE_OVERTIME_MUTATION,
  UPDATE_OVERTIME_MUTATION,
} from '@/lib/graphql/operations/overtime';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import type { OvertimeRecord, TechnicianOption } from '../overtime.constants';
import { REASON_FOR_PAYMENT_OPTIONS, getReasonLabel } from '../overtime.constants';

// ── Schema ────────────────────────────────────────────
const createOvertimeSchema = yup.object({
  workDate: yup.string().required('La fecha es obligatoria'),
  startTime: yup
    .string()
    .required('La hora de inicio es obligatoria')
    .matches(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime: yup
    .string()
    .required('La hora de fin es obligatoria')
    .matches(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  activity: yup.string().required('La actividad es obligatoria').trim(),
  reasonForPayment: yup.string().nullable().optional(),
  technicianId: yup.string().nullable().optional(),
});

type OvertimeFormValues = yup.InferType<typeof createOvertimeSchema>;

const EMPTY_FORM: OvertimeFormValues = {
  workDate: '',
  startTime: '',
  endTime: '',
  activity: '',
  reasonForPayment: null,
  technicianId: null,
};

// ── Props ─────────────────────────────────────────────
interface OvertimeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: OvertimeRecord | null; // null = create mode, object = edit mode
  isAdmin: boolean;
  technicians: TechnicianOption[];
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────
export function OvertimeFormModal({
  open,
  onOpenChange,
  record,
  isAdmin,
  technicians,
  onSuccess,
}: OvertimeFormModalProps) {
  const isEdit = record !== null;

  const form = useForm<OvertimeFormValues>({
    resolver: yupResolver(createOvertimeSchema) as never,
    defaultValues: EMPTY_FORM,
  });

  // Reset form when modal opens or record changes
  useEffect(() => {
    if (!open) return;
    if (record) {
      form.reset({
        workDate: record.workDate.split('T')[0],
        startTime: record.startTime.substring(0, 5),
        endTime: record.endTime.substring(0, 5),
        activity: record.activity,
        reasonForPayment: record.reasonForPayment ?? null,
        technicianId: record.technicianId,
      });
    } else {
      form.reset(EMPTY_FORM);
    }
  }, [open, record, form]);

  // Mutations
  const [createOvertime, { loading: creating }] = useMutation(CREATE_OVERTIME_MUTATION);
  const [updateOvertime, { loading: updating }] = useMutation(UPDATE_OVERTIME_MUTATION);
  const saving = creating || updating;

  const onSubmit = async (values: OvertimeFormValues) => {
    try {
      if (isEdit) {
        const input: Record<string, unknown> = {
          id: record!.id,
          workDate: values.workDate,
          startTime: values.startTime,
          endTime: values.endTime,
          activity: values.activity,
        };
        if (isAdmin && values.reasonForPayment) input.reasonForPayment = values.reasonForPayment;

        await updateOvertime({ variables: { input } });
        toast.success('Registro actualizado');
      } else {
        const input: Record<string, unknown> = {
          workDate: values.workDate,
          startTime: values.startTime,
          endTime: values.endTime,
          activity: values.activity,
        };
        if (isAdmin && values.technicianId) input.technicianId = values.technicianId;
        if (isAdmin && values.reasonForPayment) input.reasonForPayment = values.reasonForPayment;

        await createOvertime({ variables: { input } });
        toast.success('Registro de horas extra creado');
      }

      onOpenChange(false);
      form.reset(EMPTY_FORM);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isEdit ? 'Error al actualizar registro' : 'Error al crear registro'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Registro' : 'Registrar Horas Extra'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del registro de tiempo extra'
              : 'Ingresa los datos del registro de tiempo extra'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as never)} className="space-y-5">
          {/* ── Tecnico section (admin only) ── */}
          {isAdmin && !isEdit && (
            <div className="space-y-4 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium">Tecnico</h4>
              <div className="space-y-1.5">
                <Label>Tecnico *</Label>
                <Controller
                  name="technicianId"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tecnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.user.employeeNumber} - {t.user.firstName} {t.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}

          {/* ── Fecha y Horario section ── */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="text-sm font-medium">Fecha y Horario</h4>
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" {...form.register('workDate')} />
              {form.formState.errors.workDate && (
                <p className="text-xs text-destructive">{form.formState.errors.workDate.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Hora inicio *</Label>
                <Input type="time" {...form.register('startTime')} />
                {form.formState.errors.startTime && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.startTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Hora fin *</Label>
                <Input type="time" {...form.register('endTime')} />
                {form.formState.errors.endTime && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Actividad section ── */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="text-sm font-medium">Actividad</h4>
            <div className="space-y-1.5">
              <Label>Actividad *</Label>
              <Textarea
                {...form.register('activity')}
                placeholder="Describe la actividad realizada"
                rows={3}
              />
              {form.formState.errors.activity && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.activity.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Pago section (admin: editable select, non-admin: read-only badge if present) ── */}
          {isAdmin ? (
            <div className="space-y-4 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium">Pago</h4>
              <div className="space-y-1.5">
                <Label>Razon de pago</Label>
                <Controller
                  name="reasonForPayment"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_FOR_PAYMENT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          ) : (
            isEdit &&
            record?.reasonForPayment && (
              <div className="space-y-4 p-4 rounded-lg border border-border">
                <h4 className="text-sm font-medium">Pago</h4>
                <div className="space-y-1.5">
                  <Label>Razon de pago</Label>
                  <div className="py-2">
                    <Badge variant="secondary">{getReasonLabel(record.reasonForPayment)}</Badge>
                  </div>
                </div>
              </div>
            )
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
