'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import {
  CreateWorkOrderDocument,
  UploadWorkOrderPhotoDocument,
  GetAreasDocument,
  GetSubAreasByAreaDocument,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { toast } from 'sonner';
import { fileToBase64, enqueueTask, MAX_FILE_BYTES } from '@/lib/offline-sync';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { FileText, MapPin, CheckCircle, Send, ArrowLeft, ImageIcon, Loader2 } from 'lucide-react';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { uploadFileToBackend } from '@/lib/utils/uploads';

const crearOTSchema = yup.object({
  areaId: yup.string().required('El área es obligatoria.'),
  subAreaId: yup.string().default(''),
  description: yup
    .string()
    .required('La descripción es obligatoria.')
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(500, 'La descripción no puede exceder 500 caracteres.'),
});

type CrearOTFormValues = yup.InferType<typeof crearOTSchema>;

export default function SolicitanteCrearOTPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrearOTFormValues>({
    resolver: yupResolver(crearOTSchema),
    defaultValues: {
      areaId: '',
      subAreaId: '',
      description: '',
    },
  });

  const { data: areasData } = useQuery(GetAreasDocument);
  const [getSubAreas, { data: subAreasData }] = useLazyQuery(GetSubAreasByAreaDocument);
  const [createWorkOrder] = useMutation(CreateWorkOrderDocument);
  const [uploadPhoto] = useMutation(UploadWorkOrderPhotoDocument);

  const areas = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
  const subAreas = subAreasData?.subAreasByArea ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea) : [];

  const areaId = watch('areaId');
  const description = watch('description');
  const selectedArea = areas.find((a) => a.id === areaId);
  const isOperational = selectedArea?.type === 'OPERATIONAL';

  const handleAreaChange = (value: string) => {
    setValue('areaId', value, { shouldValidate: true });
    setValue('subAreaId', '');

    const area = areas.find(a => a.id === value);
    if (area?.type === 'OPERATIONAL') {
      getSubAreas({ variables: { areaId: value } });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      toast.error(`La imagen no puede superar ${MAX_FILE_BYTES / 1_048_576} MB`);
      e.target.value = '';
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.onerror = () => {
      reader.abort();
      toast.error('Error al leer el archivo de imagen');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (values: CrearOTFormValues) => {
    setFormError('');

    if (isOperational && !values.subAreaId) {
      setError('subAreaId', { message: 'La sub-área es obligatoria para áreas operacionales.' });
      return;
    }

    if (!user) return;

    // ── Intercepción offline ───────────────────────────────────────────────
    if (!navigator.onLine) {
      try {
        const photo = photoFile
          ? {
              base64: await fileToBase64(photoFile),
              fileName: photoFile.name,
              mimeType: photoFile.type,
            }
          : undefined;
        await enqueueTask({
          type: 'CREATE_WORK_ORDER',
          payload: {
            areaId: values.areaId,
            subAreaId: values.subAreaId || undefined,
            description: values.description.trim(),
            photo,
          },
        });
        toast.success('Guardado sin conexión. Se sincronizará automáticamente.');
        setSubmitted(true);
      } catch {
        setFormError('No se pudo guardar la solicitud localmente. Intente de nuevo.');
      }
      return;
    }

    try {
      const { data: otData } = await createWorkOrder({
        variables: {
          input: {
            areaId: values.areaId,
            subAreaId: values.subAreaId || undefined,
            description: values.description.trim(),
          },
        },
      });

      const newWorkOrderId = otData?.createWorkOrder.id;

      if (newWorkOrderId && photoFile) {
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

      setSubmitted(true);
    } catch {
      setFormError('Error al crear la orden de trabajo. Intente de nuevo.');
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-primary/20 p-6 mb-6">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Orden creada exitosamente</h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Tu solicitud ha sido registrada con estatus pendiente.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {
            setSubmitted(false);
            reset();
            setPhotoFile(null);
            setPhotoPreview(null);
          }}>
            Crear otra
          </Button>
          <Button onClick={() => navigate('/solicitante/mis-ordenes')}>
            Ver mis órdenes
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Volver" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nueva Solicitud de Trabajo</h1>
            <p className="text-muted-foreground">Completa los datos para generar una orden de trabajo</p>
          </div>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Datos de la solicitud
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
                <Label className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Area *
                </Label>
                <Combobox
                  options={areas.map((a) => ({ value: a.id, label: a.name }))}
                  value={areaId}
                  onValueChange={handleAreaChange}
                  placeholder="Seleccionar area"
                  searchPlaceholder="Buscar área..."
                  emptyText="Sin áreas"
                />
                {errors.areaId && (
                  <p className="text-xs text-destructive">{errors.areaId.message}</p>
                )}
              </div>

              {/* Sub-área (Condicional) */}
              {isOperational && (
                <div className="space-y-2">
                  <Label>Sub-área *</Label>
                  <Combobox
                    options={subAreas.map((sa) => ({ value: sa.id, label: sa.name }))}
                    value={watch('subAreaId') ?? ''}
                    onValueChange={(v) => setValue('subAreaId', v, { shouldValidate: true })}
                    placeholder="Seleccionar sub-área"
                    searchPlaceholder="Buscar sub-área..."
                    emptyText="Sin sub-áreas"
                  />
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
                  placeholder="Describe detalladamente la actividad o el problema encontrado..."
                  {...register('description')}
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
                <Label>Foto de la averia o del lugar (opcional)</Label>
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      width={800}
                      height={256}
                      className="w-full max-h-64 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="rounded-full bg-muted p-3">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Subir foto</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG hasta 5MB</p>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
