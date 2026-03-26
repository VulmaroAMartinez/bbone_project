import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  CreateMachineDocument,
  UpdateMachineDocument,
  SubAreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import type { CreateMachineInput, MachineBasicFragment } from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { useAreaMachineSelector } from '@/hooks/useAreaMachineSelector';
import { uploadFileToBackend } from '@/lib/utils/uploads';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Upload, ImageIcon, Trash2 } from 'lucide-react';

// ─── Schema ─────────────────────────────────────────────
const machineSchema = yup.object({
  code: yup.string().trim().required('El código es obligatorio'),
  name: yup.string().trim().required('El nombre es obligatorio'),
  areaId: yup.string().required('Seleccione un área'),
  subAreaId: yup.string().default(''),
  description: yup.string().trim().default(''),
  brand: yup.string().trim().default(''),
  model: yup.string().trim().default(''),
  serialNumber: yup.string().trim().default(''),
  installationDate: yup.string().default(''),
  machinePhotoUrl: yup.string().trim().default(''),
  operationalManualUrl: yup.string().trim().url('URL no válida').default(''),
});

type MachineFormValues = yup.InferType<typeof machineSchema>;

const EMPTY_FORM: MachineFormValues = {
  code: '',
  name: '',
  areaId: '',
  subAreaId: '',
  description: '',
  brand: '',
  model: '',
  serialNumber: '',
  installationDate: '',
  machinePhotoUrl: '',
  operationalManualUrl: '',
};

// ─── Props ──────────────────────────────────────────────
interface MachineFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine: MachineBasicFragment | null;
  areas: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

export function MachineFormModal({ open, onOpenChange, machine, areas, onSuccess }: MachineFormModalProps) {
  const isEditing = !!machine;

  const [createMachine] = useMutation(CreateMachineDocument);
  const [updateMachine] = useMutation(UpdateMachineDocument);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedAreaId,
    subAreasData,
    isLoadingSubAreas: subAreasLoading,
    hasSubAreas,
    subAreasLoaded,
    handleAreaChange: hookAreaChange,
    handleSubAreaChange: hookSubAreaChange,
    initWith: initSelector,
  } = useAreaMachineSelector();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MachineFormValues>({
    resolver: yupResolver(machineSchema),
    defaultValues: EMPTY_FORM,
  });

  const subAreas = subAreasData?.subAreasByArea
    ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
    : [];

  // Reset form when machine prop changes
  useEffect(() => {
    if (!open) return;
    if (machine) {
      const areaId = machine.areaId ?? machine.subArea?.area?.id ?? '';
      const subAreaId = machine.subAreaId ?? '';
      initSelector(areaId, subAreaId || undefined);
      reset({
        code: machine.code,
        name: machine.name,
        areaId,
        subAreaId,
        description: machine.description ?? '',
        brand: machine.brand ?? '',
        model: machine.model ?? '',
        serialNumber: machine.serialNumber ?? '',
        installationDate: machine.installationDate
          ? new Date(machine.installationDate).toISOString().split('T')[0]
          : '',
        machinePhotoUrl: machine.machinePhotoUrl ?? '',
        operationalManualUrl: machine.operationalManualUrl ?? '',
      });
      setPhotoPreview(machine.machinePhotoUrl || null);
    } else {
      initSelector('', '');
      reset(EMPTY_FORM);
      setPhotoPreview(null);
    }
  }, [open, machine, reset, initSelector]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedFile = await uploadFileToBackend(file);
      setValue('machinePhotoUrl', uploadedFile.absoluteUrl);
      setPhotoPreview(uploadedFile.absoluteUrl);
      toast.success('Imagen subida correctamente');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    setValue('machinePhotoUrl', '');
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAreaChange = (areaId: string) => {
    hookAreaChange(areaId);
    setValue('areaId', areaId);
    setValue('subAreaId', '');
  };

  const onSubmit = async (values: MachineFormValues) => {
    setIsSaving(true);
    try {
      const payload: CreateMachineInput = {
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        brand: values.brand || undefined,
        model: values.model || undefined,
        serialNumber: values.serialNumber || undefined,
        installationDate: values.installationDate
          ? new Date(values.installationDate).toISOString()
          : undefined,
        machinePhotoUrl: values.machinePhotoUrl || undefined,
        operationalManualUrl: values.operationalManualUrl || undefined,
      };

      if (values.subAreaId) {
        payload.subAreaId = values.subAreaId;
      } else {
        payload.areaId = values.areaId;
      }

      if (machine) {
        await updateMachine({ variables: { id: machine.id, input: payload } });
        toast.success('Máquina actualizada correctamente');
      } else {
        await createMachine({ variables: { input: payload } });
        toast.success('Máquina creada correctamente');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar la máquina');
    } finally {
      setIsSaving(false);
    }
  };

  const FieldError = ({ name }: { name: keyof MachineFormValues }) => {
    const err = errors[name];
    return err ? <p className="text-xs text-destructive mt-1">{err.message}</p> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Máquina' : 'Nueva Máquina'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Modificando ${machine!.code} - ${machine!.name}`
              : 'Completa los datos para registrar una máquina.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Identificación */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
              Identificación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Código *</Label>
                <Input {...register('code')} placeholder="Ej: MAQ-001" />
                <FieldError name="code" />
              </div>
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input {...register('name')} placeholder="Nombre de la máquina" />
                <FieldError name="name" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Descripción</Label>
                <Input {...register('description')} placeholder="Descripción opcional" />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
              Ubicación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Área *</Label>
                <Controller
                  name="areaId"
                  control={control}
                  render={() => (
                    <Combobox
                      options={areas.map((a) => ({ value: a.id, label: a.name }))}
                      value={watch('areaId')}
                      onValueChange={handleAreaChange}
                      placeholder="Seleccionar área..."
                      searchPlaceholder="Buscar área..."
                    />
                  )}
                />
                <FieldError name="areaId" />
              </div>
              {selectedAreaId && subAreasLoaded && hasSubAreas && (
                <div className="space-y-1.5">
                  <Label>Sub-área (Opcional)</Label>
                  <Controller
                    name="subAreaId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        options={subAreas.map((sa) => ({ value: sa.id, label: sa.name }))}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          hookSubAreaChange(val);
                        }}
                        placeholder={subAreasLoading ? 'Cargando...' : 'Seleccionar sub-área (opcional)...'}
                        searchPlaceholder="Buscar sub-área..."
                        disabled={subAreasLoading}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Especificaciones */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
              Especificaciones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input {...register('brand')} placeholder="Ej: Siemens" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input {...register('model')} placeholder="Ej: S7-1200" />
              </div>
              <div className="space-y-1.5">
                <Label>Número de serie</Label>
                <Input {...register('serialNumber')} placeholder="Ej: SN-123456" />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de instalación</Label>
                <Input type="date" {...register('installationDate')} />
              </div>
            </div>
          </div>

          {/* Foto y Documentación */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
              Foto y Documentación
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Foto de máquina</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative rounded-lg border border-border overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Foto de máquina"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        title="Cambiar imagen"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={removePhoto}
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 flex flex-col gap-1.5 text-muted-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-xs">Haz clic para subir una imagen</span>
                        <span className="text-[10px]">JPG, PNG o WebP (máx. 5MB)</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>URL Manual operativo</Label>
                <Input
                  {...register('operationalManualUrl')}
                  placeholder="https://..."
                  type="url"
                />
                <FieldError name="operationalManualUrl" />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border sticky bottom-0 bg-background">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear máquina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
