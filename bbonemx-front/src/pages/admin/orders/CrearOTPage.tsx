import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  GetAreasDocument,
  GetTechniciansDocument,
  GetShiftsDocument,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  TechnicianBasicFragmentDoc,
  UserBasicFragmentDoc,
  PositionBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle, MapPin, ImageIcon, Trash2, UserPlus2 } from 'lucide-react';
import type { MaintenanceType, WorkOrderPriority, StopType } from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { useNavigate } from 'react-router-dom';
import { useAreaMachineSelector } from '@/hooks/useAreaMachineSelector';
import { CREATE_WORK_ORDER_MUTATION, ASSIGN_WORK_ORDER_MUTATION, UPLOAD_WORK_ORDER_PHOTO_MUTATION } from '@/lib/graphql/operations/work-orders';
import { uploadFileToBackend } from '@/lib/utils/uploads';

const adminCrearOTSchema = yup.object({
  areaId: yup.string().required('El área es obligatoria.'),
  subAreaId: yup.string().default(''),
  description: yup
    .string()
    .required('La descripción es obligatoria.')
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(500, 'La descripción no puede exceder 500 caracteres.'),
  priority: yup.string().required('La prioridad es obligatoria.'),
  stoppageType: yup.string().required('El tipo de parada es obligatorio.'),
  shiftId: yup.string().required('El turno es obligatorio.'),
  maintenanceType: yup.string().required('El tipo de mantenimiento es obligatorio.'),
  scheduledDate: yup.string().default('').when('maintenanceType', {
    is: 'CORRECTIVE_SCHEDULED',
    then: (schema) => schema.required('La fecha programada es obligatoria para correctivo programado.'),
    otherwise: (schema) => schema.notRequired(),
  }),
  workType: yup.string().required('El tipo de trabajo es obligatorio.'),
  leadTechnicianId: yup.string().required('El técnico líder es obligatorio.'),
  machineId: yup.string().default(''),
});

type AdminCrearOTFormValues = yup.InferType<typeof adminCrearOTSchema>;

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'CORRECTIVE_EMERGENT', label: 'Correctivo Emergente' },
  { value: 'CORRECTIVE_SCHEDULED', label: 'Correctivo Programado' },
  { value: 'PREVENTIVE', label: 'Preventivo' },
  { value: 'FINDING', label: 'Hallazgo' },
];

const PRIORITIES: { value: WorkOrderPriority; label: string }[] = [
  { value: 'CRITICAL', label: 'Critica' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' },
];

const STOPPAGE_TYPES: { value: StopType; label: string }[] = [
  { value: 'BREAKDOWN', label: 'Averia' },
  { value: 'OTHER', label: 'Otro' },
];


type WorkTypeValue = 'PAINTING' | 'PNEUMATIC' | 'ELECTRONIC' | 'ELECTRICAL' | 'BUILDING' | 'METROLOGY' | 'AUTOMATION' | 'MECHANICAL' | 'HYDRAULIC' | 'ELECTRICAL_CONTROL' | 'OTHER';

const WORK_TYPES: { value: WorkTypeValue; label: string }[] = [
  { value: 'PAINTING', label: 'Pintura' },
  { value: 'PNEUMATIC', label: 'Neumática' },
  { value: 'ELECTRONIC', label: 'Electrónico' },
  { value: 'ELECTRICAL', label: 'Eléctrico' },
  { value: 'BUILDING', label: 'Edificio' },
  { value: 'METROLOGY', label: 'Metrología' },
  { value: 'AUTOMATION', label: 'Automatización' },
  { value: 'MECHANICAL', label: 'Mecánico' },
  { value: 'HYDRAULIC', label: 'Hidráulico' },
  { value: 'ELECTRICAL_CONTROL', label: 'Control eléctrico' },
  { value: 'OTHER', label: 'Otro' },
];


export default function AdminCrearOTPage() {
  const navigate = useNavigate();

  const { data: areasData, loading: areasLoading } = useQuery(GetAreasDocument);
  const { data: techData, loading: techLoading } = useQuery(GetTechniciansDocument);
  const { data: shiftsData } = useQuery(GetShiftsDocument);

  const {
    subAreasData,
    machinesData: machinesByAreaData,
    isLoadingSubAreas,
    isLoadingMachines,
    hasSubAreas,
    subAreasLoaded,
    areaHasMachines,
    handleAreaChange: hookAreaChange,
    handleSubAreaChange: hookSubAreaChange,
  } = useAreaMachineSelector();

  const [createWorkOrder] = useMutation(CREATE_WORK_ORDER_MUTATION);
  const [assignWorkOrder] = useMutation(ASSIGN_WORK_ORDER_MUTATION);
  const [uploadPhoto] = useMutation(UPLOAD_WORK_ORDER_PHOTO_MUTATION);

  const areas = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
  const subAreas = subAreasData?.subAreasByArea
    ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
    : [];
  const shifts = shiftsData?.shiftsActive || [];
  const activeTechnicians = useMemo(() => techData?.techniciansActive ? unmaskFragment(TechnicianBasicFragmentDoc, techData.techniciansActive) : [], [techData?.techniciansActive]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminCrearOTFormValues>({
    resolver: yupResolver(adminCrearOTSchema) as never,
    defaultValues: {
      areaId: '',
      subAreaId: '',
      description: '',
      priority: undefined,
      stoppageType: undefined,
      shiftId: '',
      maintenanceType: undefined,
      scheduledDate: '',
      workType: undefined,
      leadTechnicianId: '',
      machineId: '',
    },
  });

  const [auxiliaryTechnicians, setAuxiliaryTechnicians] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const areaId = watch('areaId');
  const subAreaId = watch('subAreaId');
  const stoppageType = watch('stoppageType');
  const maintenanceType = watch('maintenanceType');
  const description = watch('description');

  const availableMachines = useMemo(() => machinesByAreaData?.machinesByArea
    ? unmaskFragment(MachineBasicFragmentDoc, machinesByAreaData.machinesByArea)
    : [], [machinesByAreaData?.machinesByArea]);

  const showSubAreas = !!areaId && subAreasLoaded && hasSubAreas;
  // Use areaHasMachines (area-level count) so sub-area selection with 0 machines
  // does not hide the machine field or disable the Avería option.
  const showMachine = !!areaId && areaHasMachines;

  const techOptions = React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => activeTechnicians.map((tech: any) => {
      const user = unmaskFragment(UserBasicFragmentDoc, tech.user);
      const position = unmaskFragment(PositionBasicFragmentDoc, tech.position);
      return { value: user.id, label: `${user.fullName} - ${position.name}` };
    }),
    [activeTechnicians],
  );

  const machineOptions = React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => availableMachines.map((m: any) => ({ value: m.id, label: `${m.name} [${m.code}]` })),
    [availableMachines],
  );

  const handleSelectChange = (field: keyof AdminCrearOTFormValues, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handleAreaChange = (value: string) => {
    setValue('areaId', value, { shouldValidate: true });
    setValue('subAreaId', '');
    setValue('machineId', '');
    if (stoppageType === 'BREAKDOWN') {
      setValue('stoppageType', '', { shouldValidate: true });
    }
    hookAreaChange(value);
  };

  const handleSubAreaChange = (value: string) => {
    setValue('subAreaId', value, { shouldValidate: true });
    setValue('machineId', '');
    hookSubAreaChange(value);
  };

  const handleMachineChange = (machineId: string) => {
    setValue('machineId', machineId, { shouldValidate: true });

    if (!machineId) return;

    const selected = availableMachines.find((m) => m.id === machineId);
    const machineSubAreaId = selected?.subAreaId;

    if (machineSubAreaId) {
      setValue('subAreaId', machineSubAreaId, { shouldValidate: true });
      // Keep the machine selection, but sync the hook's filtering state.
      hookSubAreaChange(machineSubAreaId);
    }
  };

  const handleAddAuxiliaryTech = () => {
    setAuxiliaryTechnicians([...auxiliaryTechnicians, '']);
  };

  const handleUpdateAuxiliaryTech = (index: number, value: string) => {
    const updated = [...auxiliaryTechnicians];
    updated[index] = value;
    setAuxiliaryTechnicians(updated);
  };

  const handleRemoveAuxiliaryTech = (index: number) => {
    const updated = auxiliaryTechnicians.filter((_, i) => i !== index);
    setAuxiliaryTechnicians(updated);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: AdminCrearOTFormValues) => {
    setFormError('');

    const cleanAuxiliaryTech = auxiliaryTechnicians.filter(id => id !== '');
    const allTechIds = Array.from(new Set([values.leadTechnicianId, ...cleanAuxiliaryTech]));

    try {
      // 1. Crear OT Básica
      const createResp = await createWorkOrder({
        variables: {
          input: {
            areaId: values.areaId,
            subAreaId: values.subAreaId || undefined,
            description: values.description.trim(),
            machineId: values.machineId || undefined,
          },
        },
      });

      const newWorkOrderId = (createResp.data as unknown as { createWorkOrder?: { id?: string } })?.createWorkOrder?.id;
      if (!newWorkOrderId) throw new Error("No se pudo obtener el ID de la OT");

      // 2. Asignar Detalles
      await assignWorkOrder({
        variables: {
          id: newWorkOrderId,
          input: {
            priority: values.priority as WorkOrderPriority,
            maintenanceType: values.maintenanceType as MaintenanceType,
            stopType: values.stoppageType as StopType,
            assignedShiftId: values.shiftId,
            leadTechnicianId: values.leadTechnicianId,
            technicianIds: allTechIds,
            machineId: values.machineId || undefined,
            scheduledDate: values.scheduledDate || undefined,
            workType: values.workType as WorkTypeValue,
          }
        }
      });

      // 3. Subir Foto
      if (photoFile) {
        const uploadedPhoto = await uploadFileToBackend(photoFile);
        await uploadPhoto({
          variables: {
            input: {
              workOrderId: newWorkOrderId,
              fileName: photoFile.name,
              mimeType: photoFile.type,
              photoType: 'BEFORE',
              filePath: uploadedPhoto.url,
            }
          }
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/ordenes'), 1500);

    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Error al crear la orden de trabajo');
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Orden creada exitosamente</h3>
          <p className="text-sm text-muted-foreground mt-1">Redirigiendo a la lista de ordenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Volver" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Orden de Trabajo</h1>
          <p className="text-muted-foreground">Complete todos los datos para registrar la OT</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PlusCircle className="h-5 w-5 text-primary" />
            Datos de la OT
          </CardTitle>
          <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            {/* Area */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Area *
              </Label>
              <Combobox
                options={areas.map((a) => ({ value: a.id, label: a.name }))}
                value={areaId}
                onValueChange={handleAreaChange}
                placeholder={areasLoading ? 'Cargando areas...' : 'Seleccionar area'}
                searchPlaceholder="Buscar área..."
                emptyText="Sin áreas"
              />
              {errors.areaId && (
                <p className="text-xs text-destructive">{String(errors.areaId.message)}</p>
              )}
            </div>

            {/* Sub-área (opcional, cuando el área tiene sub-áreas) */}
            {showSubAreas && (
              <div className="space-y-2">
                <Label>Sub-área (Opcional)</Label>
                <Combobox
                  options={subAreas.map((sa) => ({ value: sa.id, label: sa.name }))}
                  value={subAreaId}
                  onValueChange={handleSubAreaChange}
                  placeholder={isLoadingSubAreas ? 'Cargando...' : 'Seleccionar sub-área'}
                  searchPlaceholder="Buscar sub-área..."
                  emptyText="Sin sub-áreas"
                />
              </div>
            )}

            {showMachine && (
              <div className="space-y-2">
                <Label>
                  Equipo/Estructura {stoppageType === 'BREAKDOWN' ? '*' : '(Opcional)'}
                </Label>
                <Combobox
                  options={machineOptions}
                  value={watch('machineId')}
                  onValueChange={handleMachineChange}
                  placeholder={isLoadingMachines ? 'Cargando equipos...' : 'Seleccionar equipo/estructura'}
                  searchPlaceholder="Buscar equipo/estructura..."
                  disabled={isLoadingMachines}
                />
              </div>
            )}

            {/* Activity description */}
            <div className="space-y-2">
              <Label htmlFor="description">Actividad o descripcion *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describa detalladamente la situacion o problema..."
                className="min-h-[120px]"
                maxLength={500}
              />
              <div className="flex justify-between">
                {errors.description ? (
                  <p className="text-xs text-destructive">{String(errors.description.message)}</p>
                ) : <span />}
                <p className="text-xs text-muted-foreground">
                  {description?.length || 0}/500
                </p>
              </div>
            </div>

            {/* Photo (optional) */}
            <div className="space-y-2">
              <Label>Foto (opcional)</Label>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Vista previa" width={800} height={192} className="w-full max-h-48 object-cover rounded-lg border border-border" />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>
                    Eliminar
                  </Button>
                </div>
              ) : (
                <label htmlFor="admin-photo" className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subir foto</span>
                  <input id="admin-photo" type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <hr className="border-border" />

            {/* Priority + Stoppage type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-priority">Prioridad *</Label>
                <Select value={watch('priority') ?? ''} onValueChange={(v) => handleSelectChange('priority', v)}>
                  <SelectTrigger id="admin-priority" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-xs text-destructive">{String(errors.priority.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-stoppage">Tipo de parada *</Label>
                <Select value={watch('stoppageType') ?? ''} onValueChange={(v) => {
                  handleSelectChange('stoppageType', v);
                  if (v === 'BREAKDOWN' && !showMachine) {
                    handleSelectChange('stoppageType', '');
                  }
                }}>
                  <SelectTrigger id="admin-stoppage" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {STOPPAGE_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value} disabled={s.value === 'BREAKDOWN' && !showMachine}>
                        {s.label}{s.value === 'BREAKDOWN' && !showMachine ? ' (sin equipos en el área)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stoppageType && (
                  <p className="text-xs text-destructive">{String(errors.stoppageType.message)}</p>
                )}
              </div>
            </div>

            {/* Shift + Maintenance type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-shift">Turno *</Label>
                <Select value={watch('shiftId')} onValueChange={(v) => handleSelectChange('shiftId', v)}>
                  <SelectTrigger id="admin-shift" className="w-full">
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shiftId && (
                  <p className="text-xs text-destructive">{String(errors.shiftId.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-maintenance">Tipo de mantenimiento *</Label>
                <Select value={watch('maintenanceType') ?? ''} onValueChange={(v) => handleSelectChange('maintenanceType', v)}>
                  <SelectTrigger id="admin-maintenance" className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.maintenanceType && (
                  <p className="text-xs text-destructive">{String(errors.maintenanceType.message)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-work-type">Tipo de trabajo *</Label>
              <Select value={watch('workType') ?? ''} onValueChange={(v) => handleSelectChange('workType', v)}>
                <SelectTrigger id="admin-work-type" className="w-full">
                  <SelectValue placeholder="Seleccionar tipo de trabajo" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((wt) => (
                    <SelectItem key={wt.value} value={wt.value}>{wt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.workType && (
                <p className="text-xs text-destructive">{String(errors.workType.message)}</p>
              )}
            </div>

            {maintenanceType === 'CORRECTIVE_SCHEDULED' && (
              <div className="space-y-2">
                <Label htmlFor="admin-scheduled-date">Fecha programada *</Label>
                <Input
                  id="admin-scheduled-date"
                  type="date"
                  {...register('scheduledDate')}
                />
                {errors.scheduledDate && (
                  <p className="text-xs text-destructive">{String(errors.scheduledDate.message)}</p>
                )}
              </div>
            )}

            {/* SECCIÓN DE TÉCNICOS */}
            <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-border">
              <div className="space-y-2">
                <Label htmlFor="admin-lead-tech" className="text-primary font-semibold">Técnico Líder *</Label>
                <Combobox
                  options={techOptions}
                  value={watch('leadTechnicianId')}
                  onValueChange={(v) => handleSelectChange('leadTechnicianId', v)}
                  placeholder={techLoading ? 'Cargando técnicos...' : 'Seleccionar líder de la actividad'}
                  searchPlaceholder="Buscar técnico..."
                  disabled={techLoading}
                />
                {errors.leadTechnicianId && (
                  <p className="text-xs text-destructive">{String(errors.leadTechnicianId.message)}</p>
                )}
              </div>

              {/* Técnicos de Apoyo Dinámicos */}
              <div className="space-y-3" role="group" aria-labelledby="admin-aux-tech-label">
                <Label id="admin-aux-tech-label" className="text-sm font-medium">Técnicos de Apoyo (Opcional)</Label>

                {auxiliaryTechnicians.map((auxTechId, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Combobox
                      options={techOptions.filter((o: { value: string }) => o.value !== watch('leadTechnicianId'))}
                      value={auxTechId}
                      onValueChange={(v) => handleUpdateAuxiliaryTech(index, v)}
                      placeholder="Seleccionar técnico de apoyo"
                      searchPlaceholder="Buscar técnico..."
                      triggerClassName="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" aria-label="Eliminar técnico de apoyo" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveAuxiliaryTech(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={handleAddAuxiliaryTech} className="w-full border-dashed">
                  <UserPlus2 className="h-4 w-4 mr-2" /> Agregar técnico de apoyo
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear OT
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
