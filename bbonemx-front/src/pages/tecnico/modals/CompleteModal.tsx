import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import type { WorkOrderStatus } from '@/lib/graphql/generated/graphql';
import {
  GET_MACHINE_SPARE_PARTS_FOR_WO,
  GET_ACTIVE_MATERIALS_QUERY,
} from '@/lib/graphql/operations/work-orders';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Wrench, Package, Boxes } from 'lucide-react';

// ─── Schema ─────────────────────────────────────────────
const closeSchema = yup.object({
  finalStatus: yup
    .mixed<WorkOrderStatus>()
    .oneOf(['FINISHED', 'TEMPORARY_REPAIR'])
    .required('El estado final es requerido'),
  breakdownDescription: yup.string().default(''),
  cause: yup.string().when('$isAveria', {
    is: true,
    then: (s) => s.trim().required('La causa raíz es requerida para averías'),
    otherwise: (s) => s.default(''),
  }),
  actionTaken: yup.string().when('$isAveria', {
    is: true,
    then: (s) => s.trim().required('La acción realizada es requerida para averías'),
    otherwise: (s) => s.default(''),
  }),
  downtimeMinutes: yup.number().when('$isAveria', {
    is: true,
    then: (s) =>
      s
        .typeError('Debe ser un número')
        .min(0, 'No puede ser negativo')
        .required('El tiempo muerto es requerido para averías'),
    otherwise: (s) => s.nullable().optional(),
  }),
  observations: yup.string().when('$isAveria', {
    is: false,
    then: (s) => s.trim().required('Las observaciones son requeridas'),
    otherwise: (s) => s.default(''),
  }),
  toolsUsed: yup.string().default(''),
  usedSparePart: yup.boolean().default(false),
  sparePartId: yup.string().nullable().optional(),
  customSparePart: yup.string().default(''),
  materialId: yup.string().nullable().optional(),
  customMaterial: yup.string().default(''),
});

export type CloseFormValues = yup.InferType<typeof closeSchema>;

// ─── Props ──────────────────────────────────────────────
interface CompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAveria: boolean;
  machineId: string | null | undefined;
  onConfirm: (values: CloseFormValues) => Promise<void>;
  isCompleting: boolean;
}

export function CompleteModal({
  open,
  onOpenChange,
  isAveria,
  machineId,
  onConfirm,
  isCompleting,
}: CompleteModalProps) {
  const [fetchSpareParts, { data: sparePartsData, loading: sparePartsLoading }] =
    useLazyQuery(GET_MACHINE_SPARE_PARTS_FOR_WO);

  const { data: materialsData } = useQuery(GET_ACTIVE_MATERIALS_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CloseFormValues>({
    resolver: yupResolver(closeSchema) as unknown as import('react-hook-form').Resolver<CloseFormValues>,
    context: { isAveria },
    defaultValues: {
      finalStatus: 'FINISHED',
      breakdownDescription: '',
      cause: '',
      actionTaken: '',
      downtimeMinutes: undefined,
      observations: '',
      toolsUsed: '',
      usedSparePart: false,
      sparePartId: null,
      customSparePart: '',
      materialId: null,
      customMaterial: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedSparePartId = watch('sparePartId');
  const watchedMaterialId = watch('materialId');
  const usedSparePart = watch('usedSparePart');

  // Load spare parts when modal opens
  useEffect(() => {
    if (open && machineId) {
      fetchSpareParts({ variables: { machineId } });
    }
  }, [open, machineId, fetchSpareParts]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      reset({
        finalStatus: 'FINISHED',
        breakdownDescription: '',
        cause: '',
        actionTaken: '',
        downtimeMinutes: undefined,
        observations: '',
        toolsUsed: '',
        usedSparePart: false,
        sparePartId: null,
        customSparePart: '',
        materialId: null,
        customMaterial: '',
      });
    }
  }, [open, reset]);

  const spareParts = (sparePartsData as unknown as { sparePartsByMachine?: Array<{ id: string; brand?: string; model?: string; partNumber?: string }> })?.sparePartsByMachine ?? [];
  const materials = (materialsData as unknown as { materialsActive?: Array<{ id: string; description?: string; brand?: string; partNumber?: string }> })?.materialsActive ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl h-[90vh] max-h-[90vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Cerrar Orden de Trabajo</DialogTitle>
          <DialogDescription>
            Complete el reporte técnico antes de cerrar la OT.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onConfirm)} className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
          <div className="min-h-0 overflow-y-auto pr-4">
            <div className="space-y-5 py-2">
              {/* 1. Estado final */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/10">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Estado Final
                </h4>
                <Controller
                  name="finalStatus"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-3"
                    >
                      <div
                        className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => field.onChange('FINISHED')}
                      >
                        <RadioGroupItem value="FINISHED" id="status-finished" className="mt-1" />
                        <div>
                          <Label htmlFor="status-finished" className="text-sm font-semibold cursor-pointer">
                            Arreglo Definitivo (Finalizada)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            La máquina quedó reparada en óptimas condiciones.
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-start space-x-3 border border-amber-500/30 bg-amber-500/5 p-4 rounded-lg hover:bg-amber-500/10 cursor-pointer"
                        onClick={() => field.onChange('TEMPORARY_REPAIR')}
                      >
                        <RadioGroupItem value="TEMPORARY_REPAIR" id="status-temp" className="mt-1" />
                        <div>
                          <Label htmlFor="status-temp" className="text-sm font-semibold text-amber-700 cursor-pointer">
                            Reparación Temporal (Parche)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Funciona, pero requiere intervención definitiva posterior.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* 2. Campos según tipo de parada */}
              <div className="space-y-4 p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  {isAveria ? 'Reporte de Avería' : 'Observaciones'}
                </h4>

                {isAveria ? (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Campos de avería
                    </p>

                    <div className="space-y-2">
                      <Label>Descripción técnica de la falla</Label>
                      <Textarea
                        {...register('breakdownDescription')}
                        placeholder="Detalle técnico de lo encontrado fallando..."
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Causa Raíz <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          {...register('cause')}
                          placeholder="Motivo que originó la falla..."
                          rows={3}
                        />
                        {errors.cause && (
                          <p className="text-xs text-destructive">{errors.cause.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Tiempo Muerto <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            {...register('downtimeMinutes', { valueAsNumber: true })}
                            className="w-32"
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground">minutos</span>
                        </div>
                        {errors.downtimeMinutes && (
                          <p className="text-xs text-destructive">
                            {errors.downtimeMinutes.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Acción Realizada <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        {...register('actionTaken')}
                        placeholder="Describe las acciones realizadas..."
                        rows={3}
                      />
                      {errors.actionTaken && (
                        <p className="text-xs text-destructive">{errors.actionTaken.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      Observaciones <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      {...register('observations')}
                      placeholder="Describe las observaciones del trabajo realizado..."
                      rows={3}
                    />
                    {errors.observations && (
                      <p className="text-xs text-destructive">{errors.observations.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Herramientas y materiales */}
              <div className="space-y-4 p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Recursos Utilizados
                </h4>

                {/* Herramienta */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" /> Herramienta utilizada
                    <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <Input
                    {...register('toolsUsed')}
                    placeholder="Ej: Llave 10mm, pinza de punta..."
                  />
                </div>

                {/* Refacciones */}
                {machineId && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" /> ¿Utilizó refacción del catálogo?
                        <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                      </Label>
                      <Controller
                        name="usedSparePart"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value === true ? 'yes' : 'no'}
                            onValueChange={(v) => {
                              const yes = v === 'yes';
                              field.onChange(yes);
                              if (!yes) {
                                setValue('sparePartId', null);
                                setValue('customSparePart', '');
                              }
                            }}
                            className="flex flex-wrap gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="used-spare-yes" />
                              <Label htmlFor="used-spare-yes" className="font-normal cursor-pointer">
                                Sí
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="used-spare-no" />
                              <Label htmlFor="used-spare-no" className="font-normal cursor-pointer">
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>
                    {usedSparePart === true && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Seleccionar refacción</Label>
                        {sparePartsLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <Controller
                            name="sparePartId"
                            control={control}
                            render={({ field }) => (
                              <Combobox
                                options={[
                                  ...spareParts.map((sp) => ({
                                    value: sp.id,
                                    label: `${sp.brand} ${sp.model} — ${sp.partNumber}`,
                                  })),
                                  { value: 'OTHER', label: 'Otra (especificar)' },
                                ]}
                                value={field.value ?? ''}
                                onValueChange={(v) => field.onChange(v || null)}
                                placeholder="Selecciona una refacción..."
                                searchPlaceholder="Buscar refacción..."
                              />
                            )}
                          />
                        )}
                        {watchedSparePartId === 'OTHER' && (
                          <Input
                            {...register('customSparePart')}
                            placeholder="Describe la refacción utilizada..."
                            className="mt-2"
                          />
                        )}
                        {spareParts.length === 0 && !sparePartsLoading && (
                          <p className="text-xs text-muted-foreground">
                            Esta máquina no tiene refacciones registradas en catálogo.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Materiales */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-muted-foreground" /> Material utilizado
                    <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <Controller
                    name="materialId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        options={[
                          { value: '', label: 'Sin material' },
                          ...materials.map((m) => ({
                            value: m.id,
                            label: `${m.description}${m.brand ? ` — ${m.brand}` : ''}${m.partNumber ? ` (${m.partNumber})` : ''}`,
                          })),
                          { value: 'OTHER', label: 'Otro (especificar)' },
                        ]}
                        value={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v || null)}
                        placeholder="Selecciona un material..."
                        searchPlaceholder="Buscar material..."
                      />
                    )}
                  />
                  {watchedMaterialId === 'OTHER' && (
                    <Input
                      {...register('customMaterial')}
                      placeholder="Describe el material utilizado..."
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCompleting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCompleting}>
              {isCompleting ? 'Guardando...' : 'Confirmar Cierre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
