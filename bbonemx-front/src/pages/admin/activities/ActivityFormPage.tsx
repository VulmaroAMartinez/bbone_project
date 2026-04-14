import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { gql } from '@apollo/client';
import {
  ActivityItemFragmentDoc,
  GetActivityByIdDocument,
  GetMachinesByAreaDocument,
  MachineBasicFragmentDoc,
  CreateActivityDocument,
  UpdateActivityDocument,
} from '@/lib/graphql/generated/graphql';
import type { ActivityStatus } from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';

const GET_FORM_DATA = gql`
  query GetActivityFormData {
    areasActive {
      id
      name
    }
    subAreasActive {
      id
      name
      areaId
    }
    techniciansActive {
      id
      isActive
      user {
        id
        firstName
        lastName
        fullName
        employeeNumber
      }
    }
  }
`;

type FormDataQuery = {
  areasActive: Array<{ id: string; name: string }>;
  subAreasActive: Array<{ id: string; name: string; areaId: string }>;
  techniciansActive: Array<{
    id: string;
    isActive: boolean;
    user: {
      id: string;
      fullName: string;
      employeeNumber: string;
    };
  }>;
};

const schema = yup.object({
  areaId: yup.string().required('El área es requerida'),
  machineId: yup.string().optional().default(''),
  activity: yup.string().trim().required('La actividad es requerida'),
  startDate: yup.string().required('La fecha de inicio es requerida'),
  endDate: yup
    .string()
    .transform((v) => (v === '' || v == null ? undefined : v))
    .optional()
    .test(
      'valid-end-date',
      'La fecha de fin no es válida',
      (value) => value === undefined || !Number.isNaN(Date.parse(value)),
    ),
  progress: yup
    .number()
    .min(0, 'Mínimo 0')
    .max(100, 'Máximo 100')
    .integer('Debe ser entero')
    .default(0),
  status: yup
    .mixed<ActivityStatus>()
    .oneOf(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .default('PENDING'),
  comments: yup.string().optional().default(''),
  priority: yup.boolean().default(false),
  technicianIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Debe asignar al menos un técnico')
    .required('Debe asignar al menos un técnico'),
});

type FormValues = Omit<yup.InferType<typeof schema>, 'endDate'> & {
  endDate?: string;
};

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: formData, loading: loadingFormData } = useQuery<FormDataQuery>(GET_FORM_DATA);
  const { data: activityData, loading: loadingActivity } = useQuery(
    GetActivityByIdDocument,
    { variables: { id: id! }, skip: !isEditing, fetchPolicy: 'network-only' },
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      areaId: '',
      machineId: '',
      activity: '',
      startDate: '',
      endDate: undefined,
      progress: 0,
      status: 'PENDING',
      comments: '',
      priority: false,
      technicianIds: [],
    },
  });

  const [selectedSubAreaId, setSelectedSubAreaId] = useState('');

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedAreaId = watch('areaId');
  const { data: machinesData } = useQuery(GetMachinesByAreaDocument, {
    variables: {
      areaId: selectedAreaId || undefined,
      subAreaId: selectedSubAreaId || undefined,
    },
    skip: !selectedAreaId,
  });

  const [createActivity, { loading: creating }] = useMutation(CreateActivityDocument);
  const [updateActivity, { loading: updating }] = useMutation(UpdateActivityDocument);
  const isSaving = creating || updating;
  const activity = useFragment(
    ActivityItemFragmentDoc,
    activityData?.activity ?? null,
  );

  // Populate form on edit
  useEffect(() => {
    if (isEditing && activity) {
      console.log('[ActivityForm] Populating for edit:', activity);
      const a = activity;
      reset({
        areaId: a.areaId,
        machineId: a.machineId || '',
        activity: a.activity,
        startDate: a.startDate ? a.startDate.split('T')[0] : '',
        endDate: a.endDate ? a.endDate.split('T')[0] : undefined,
        progress: a.progress,
        status: a.status,
        comments: a.comments || '',
        priority: a.priority,
        technicianIds: a.technicians?.map((t) => t.technicianId) || [],
      });
    }
  }, [activity, isEditing, reset]);

  const areaOptions = useMemo(() => {
    const areas = formData?.areasActive ?? [];
    const subAreas = formData?.subAreasActive ?? [];
    const options: Array<{ value: string; label: string }> = [];
    for (const area of areas) {
      options.push({ value: area.id, label: area.name });
      const areaSubs = subAreas.filter((s) => s.areaId === area.id);
      for (const sub of areaSubs) {
        options.push({ value: `${area.id}|${sub.id}`, label: `${area.name} - ${sub.name}` });
      }
    }
    return options;
  }, [formData]);

  const machines = useFragment(MachineBasicFragmentDoc, machinesData?.machinesByArea ?? []);
  const machineOptions = useMemo(
    () => machines.map((m) => ({ value: m.id, label: m.name })),
    [machines],
  );

  const technicianOptions = useMemo(
    () =>
      (formData?.techniciansActive || []).map((t) => ({
        value: t.user.id,
        label: `${t.user.fullName} (${t.user.employeeNumber})`,
      })),
    [formData],
  );

  const onSubmit = async (values: FormValues) => {
    console.log('[ActivityForm] Submitting values:', values);
    try {
      if (isEditing) {
        console.log('[ActivityForm] Updating activity ID:', id);
        const result = await updateActivity({
          variables: {
            id: id!,
            input: {
              areaId: values.areaId,
              machineId: values.machineId || null,
              activity: values.activity,
              startDate: values.startDate,
              endDate: values.endDate ?? null,
              progress: Number(values.progress),
              status: values.status as ActivityStatus,
              comments: values.comments || undefined,
              priority: values.priority,
              technicianIds: values.technicianIds as string[],
            },
          },
        });
        console.log('[ActivityForm] Update result:', result);
        toast.success('Actividad actualizada');
      } else {
        console.log('[ActivityForm] Creating activity');
        const result = await createActivity({
          variables: {
            input: {
              areaId: values.areaId,
              machineId: values.machineId || null,
              activity: values.activity,
              startDate: values.startDate,
              ...(values.endDate ? { endDate: values.endDate } : {}),
              progress: Number(values.progress),
              status: values.status as ActivityStatus,
              comments: values.comments || undefined,
              priority: values.priority,
              technicianIds: values.technicianIds as string[],
            },
          },
        });
        console.log('[ActivityForm] Create result:', result);
        toast.success('Actividad creada');
      }
      navigate('/admin/actividades');
    } catch (err: unknown) {
      console.error('[ActivityForm] Error saving activity:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar actividad');
    }
  };

  if (loadingFormData || (isEditing && loadingActivity)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/actividades')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Área */}
              <div className="space-y-2">
                <Label>Área *</Label>
                <Controller
                  name="areaId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={areaOptions}
                      value={
                        selectedSubAreaId
                          ? `${field.value}|${selectedSubAreaId}`
                          : field.value
                      }
                      onValueChange={(v) => {
                        if (v.includes('|')) {
                          const [areaId, subAreaId] = v.split('|');
                          field.onChange(areaId);
                          setSelectedSubAreaId(subAreaId);
                        } else {
                          field.onChange(v);
                          setSelectedSubAreaId('');
                        }
                        setValue('machineId', '');
                      }}
                      placeholder="Seleccionar área"
                      searchPlaceholder="Buscar área..."
                    />
                  )}
                />
                {errors.areaId && <p className="text-xs text-destructive">{errors.areaId.message}</p>}
              </div>

              {/* Máquina */}
              <div className="space-y-2">
                <Label>Equipo (Opcional)</Label>
                <Controller
                  name="machineId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={machineOptions}
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder="Seleccionar equipo"
                      searchPlaceholder="Buscar equipo..."
                      disabled={!selectedAreaId}
                    />
                  )}
                />
                {errors.machineId && <p className="text-xs text-destructive">{errors.machineId.message}</p>}
              </div>
            </div>

            {/* Actividad */}
            <div className="space-y-2">
              <Label>Actividad *</Label>
              <Input {...register('activity')} placeholder="Descripción de la actividad" />
              {errors.activity && <p className="text-xs text-destructive">{errors.activity.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha inicio */}
              <div className="space-y-2">
                <Label>Fecha Inicio *</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>

              {/* Fecha fin */}
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Avance */}
              <div className="space-y-2">
                <Label>Avance (%)</Label>
                <Input type="number" min={0} max={100} {...register('progress')} />
                {errors.progress && <p className="text-xs text-destructive">{errors.progress.message}</p>}
              </div>

              {/* Estatus */}
              <div className="space-y-2">
                <Label>Estatus</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                        <SelectItem value="COMPLETED">Realizado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="priority"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label htmlFor="priority" className="text-sm cursor-pointer">
                    Marcar como prioritaria
                  </label>
                </div>
              </div>
            </div>

            {/* Técnicos */}
            <div className="space-y-2">
              <Label>Técnicos Responsables *</Label>
              <Controller
                name="technicianIds"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Combobox
                      options={technicianOptions.filter(
                        (t) => !(field.value || []).includes(t.value),
                      )}
                      value=""
                      onValueChange={(v) => {
                        if (v && !(field.value || []).includes(v)) {
                          field.onChange([...(field.value || []), v]);
                        }
                      }}
                      placeholder="Agregar técnico..."
                      searchPlaceholder="Buscar técnico..."
                    />
                    {(field.value || []).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(field.value || []).map((techId: string) => {
                          const tech = technicianOptions.find((t) => t.value === techId);
                          return (
                            <span
                              key={techId}
                              className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                            >
                              {tech?.label || techId}
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive ml-1"
                                onClick={() =>
                                  field.onChange((field.value || []).filter((id: string) => id !== techId))
                                }
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.technicianIds && (
                <p className="text-xs text-destructive">{errors.technicianIds.message}</p>
              )}
            </div>

            {/* Comentarios */}
            <div className="space-y-2">
              <Label>Comentarios</Label>
              <Textarea {...register('comments')} placeholder="Comentarios opcionales..." rows={3} />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/actividades')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear actividad'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
