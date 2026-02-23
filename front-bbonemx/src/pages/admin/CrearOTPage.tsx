import React, { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  GetAreasDocument,
  GetSubAreasByAreaDocument,
  GetTechniciansDocument,
  GetShiftsDocument,
  GetMachinesDocument,
  CreateWorkOrderDocument,
  AssignWorkOrderDocument,
  UploadWorkOrderPhotoDocument,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle, MapPin, ImageIcon, Trash2, UserPlus2 } from 'lucide-react';
import type { MaintenanceType, WorkOrderPriority, StopType } from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { useNavigate } from 'react-router-dom';

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

export default function AdminCrearOTPage() {
  const navigate = useNavigate();

  const { data: areasData, loading: areasLoading } = useQuery(GetAreasDocument);
  const { data: techData, loading: techLoading } = useQuery(GetTechniciansDocument);
  const { data: shiftsData } = useQuery(GetShiftsDocument);

  const [getSubAreas, { data: subAreasData }] = useLazyQuery(GetSubAreasByAreaDocument);
  const [getMachines, { data: machinesData }] = useLazyQuery(GetMachinesDocument);

  const [createWorkOrder] = useMutation(CreateWorkOrderDocument);
  const [assignWorkOrder] = useMutation(AssignWorkOrderDocument);
  const [uploadPhoto] = useMutation(UploadWorkOrderPhotoDocument);

  const areas = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
  const subAreas = subAreasData?.subAreasByArea ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea) : [];
  const shifts = shiftsData?.shiftsActive || [];
  const activeTechnicians = techData?.techniciansActive ? unmaskFragment(TechnicianBasicFragmentDoc, techData.techniciansActive) : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminCrearOTFormValues>({
    resolver: yupResolver(adminCrearOTSchema),
    defaultValues: {
      areaId: '',
      subAreaId: '',
      description: '',
      priority: undefined,
      stoppageType: undefined,
      shiftId: '',
      maintenanceType: undefined,
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
  const description = watch('description');

  const allMachinesRaw = machinesData?.machinesActive || [];
  const filteredMachinesRaw = allMachinesRaw.filter(m => m.subAreaId === subAreaId);
  const availableMachines = unmaskFragment(MachineBasicFragmentDoc, filteredMachinesRaw);

  const selectedArea = areas.find((a) => a.id === areaId);
  const isOperational = selectedArea?.type === 'OPERATIONAL';
  const showMachine = stoppageType === 'BREAKDOWN' || (isOperational && !!subAreaId);

  const handleSelectChange = (field: keyof AdminCrearOTFormValues, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handleAreaChange = (value: string) => {
    setValue('areaId', value, { shouldValidate: true });
    setValue('subAreaId', '');
    setValue('machineId', '');

    const area = areas.find(a => a.id === value);
    if (area?.type === 'OPERATIONAL') {
      getSubAreas({ variables: { areaId: value } });
      getMachines();
    }
  };

  const handleSubAreaChange = (value: string) => {
    setValue('subAreaId', value, { shouldValidate: true });
    setValue('machineId', '');
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

    // Conditional validation for subAreaId
    if (isOperational && !values.subAreaId) {
      setError('subAreaId', { message: 'La sub-área es obligatoria para áreas operacionales.' });
      return;
    }

    const cleanAuxiliaryTech = auxiliaryTechnicians.filter(id => id !== '');
    const allTechIds = Array.from(new Set([values.leadTechnicianId, ...cleanAuxiliaryTech]));

    try {
      // 1. Crear OT Básica
      const { data: createData } = await createWorkOrder({
        variables: {
          input: {
            areaId: values.areaId,
            subAreaId: values.subAreaId || undefined,
            description: values.description.trim(),
            machineId: values.machineId || undefined,
          },
        },
      });

      const newWorkOrderId = createData?.createWorkOrder.id;
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
          }
        }
      });

      // 3. Subir Foto
      if (photoFile) {
        const mockPath = `uploads/${newWorkOrderId}/${photoFile.name}`;
        await uploadPhoto({
          variables: {
            input: {
              workOrderId: newWorkOrderId,
              fileName: photoFile.name,
              mimeType: photoFile.type,
              photoType: 'BEFORE',
              filePath: mockPath,
            }
          }
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/ordenes'), 1500);

    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error al crear la orden de trabajo');
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="admin-area" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Area *
              </Label>
              <Select value={areaId} onValueChange={handleAreaChange}>
                <SelectTrigger id="admin-area">
                  <SelectValue placeholder={areasLoading ? 'Cargando areas...' : 'Seleccionar area'} />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.areaId && (
                <p className="text-xs text-destructive">{errors.areaId.message}</p>
              )}
            </div>

            {/* Sub-area (solo si es operacional) */}
            {isOperational && subAreas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="admin-sub-area">Sub-area *</Label>
                <Select value={subAreaId} onValueChange={handleSubAreaChange}>
                  <SelectTrigger id="admin-sub-area">
                    <SelectValue placeholder="Seleccionar sub-area" />
                  </SelectTrigger>
                  <SelectContent>
                    {subAreas.map((sa) => (
                      <SelectItem key={sa.id} value={sa.id}>{sa.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subAreaId && (
                  <p className="text-xs text-destructive">{errors.subAreaId.message}</p>
                )}
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
                  <p className="text-xs text-destructive">{errors.description.message}</p>
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
                <Select value={watch('priority')} onValueChange={(v) => handleSelectChange('priority', v)}>
                  <SelectTrigger id="admin-priority"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-xs text-destructive">{errors.priority.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-stoppage">Tipo de parada *</Label>
                <Select value={watch('stoppageType')} onValueChange={(v) => handleSelectChange('stoppageType', v)}>
                  <SelectTrigger id="admin-stoppage"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {STOPPAGE_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stoppageType && (
                  <p className="text-xs text-destructive">{errors.stoppageType.message}</p>
                )}
              </div>
            </div>

            {/* Shift + Maintenance type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-shift">Turno *</Label>
                <Select value={watch('shiftId')} onValueChange={(v) => handleSelectChange('shiftId', v)}>
                  <SelectTrigger id="admin-shift"><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shiftId && (
                  <p className="text-xs text-destructive">{errors.shiftId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-maintenance">Tipo de mantenimiento *</Label>
                <Select value={watch('maintenanceType')} onValueChange={(v) => handleSelectChange('maintenanceType', v)}>
                  <SelectTrigger id="admin-maintenance"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.maintenanceType && (
                  <p className="text-xs text-destructive">{errors.maintenanceType.message}</p>
                )}
              </div>
            </div>

            {/* SECCIÓN DE TÉCNICOS */}
            <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-border">
              <div className="space-y-2">
                <Label htmlFor="admin-lead-tech" className="text-primary font-semibold">Técnico Líder *</Label>
                <Select value={watch('leadTechnicianId')} onValueChange={(v) => handleSelectChange('leadTechnicianId', v)}>
                  <SelectTrigger id="admin-lead-tech">
                    <SelectValue placeholder={techLoading ? 'Cargando técnicos...' : 'Seleccionar líder de la actividad'} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTechnicians.map((tech) => {
                      const user = unmaskFragment(UserBasicFragmentDoc, tech.user);
                      const position = unmaskFragment(PositionBasicFragmentDoc, tech.position);
                      return (
                        <SelectItem key={tech.id} value={tech.id}>
                          {user.fullName} - <span className="text-muted-foreground">{position.name}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.leadTechnicianId && (
                  <p className="text-xs text-destructive">{errors.leadTechnicianId.message}</p>
                )}
              </div>

              {/* Técnicos de Apoyo Dinámicos */}
              <div className="space-y-3" role="group" aria-labelledby="admin-aux-tech-label">
                <Label id="admin-aux-tech-label" className="text-sm font-medium">Técnicos de Apoyo (Opcional)</Label>

                {auxiliaryTechnicians.map((auxTechId, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={auxTechId} onValueChange={(v) => handleUpdateAuxiliaryTech(index, v)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar técnico de apoyo" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTechnicians
                          .filter(t => t.id !== watch('leadTechnicianId'))
                          .map((tech) => {
                            const user = unmaskFragment(UserBasicFragmentDoc, tech.user);
                            const position = unmaskFragment(PositionBasicFragmentDoc, tech.position);
                            return (
                              <SelectItem key={tech.id} value={tech.id}>
                                {user.fullName} - <span className="text-muted-foreground">{position.name}</span>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
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

            {showMachine && (
              <div className="space-y-2">
                <Label>Máquina (Opcional)</Label>
                <Select value={watch('machineId')} onValueChange={(v) => handleSelectChange('machineId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar máquina afectada" /></SelectTrigger>
                  <SelectContent>
                    {availableMachines.length > 0 ? availableMachines.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} [{m.code}]</SelectItem>) : <SelectItem value="none" disabled>No hay máquinas</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}

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
