import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/auth-context';

import {
  GetWorkOrderByIdDocument,
  StartWorkOrderDocument,
  PauseWorkOrderDocument,
  CompleteWorkOrderDocument,
  UploadWorkOrderPhotoDocument,
  SignWorkOrderDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  type WorkOrderStatus,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import {
  ADD_WORK_ORDER_SPARE_PART_MUTATION,
  ADD_WORK_ORDER_MATERIAL_MUTATION,
  GET_MACHINE_SPARE_PARTS_FOR_WO,
  GET_ACTIVE_MATERIALS_QUERY,
} from '@/lib/graphql/operations/work-orders';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge, StopTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignatureDialog } from '@/components/ui/signature-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  MapPin,
  Wrench,
  FileText,
  AlertTriangle,
  Timer,
  Play,
  Square,
  Pause,
  ImageIcon,
  Pen,
  Package,
  Boxes,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Schema del modal de cierre ─────────────────────────────────────────────
const closeSchema = yup.object({
  finalStatus: yup
    .mixed<WorkOrderStatus>()
    .oneOf(['COMPLETED', 'TEMPORARY_REPAIR'])
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
  sparePartId: yup.string().nullable().optional(),
  customSparePart: yup.string().default(''),
  materialId: yup.string().nullable().optional(),
  customMaterial: yup.string().default(''),
});

type CloseFormValues = yup.InferType<typeof closeSchema>;

// ─── Componente principal ────────────────────────────────────────────────────
export default function TecnicoOrdenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // ─── Queries / Mutations
  const { data, loading, error, refetch } = useQuery(GetWorkOrderByIdDocument, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const [fetchSpareParts, { data: sparePartsData, loading: sparePartsLoading }] =
    useLazyQuery(GET_MACHINE_SPARE_PARTS_FOR_WO);

  const { data: materialsData } = useQuery(GET_ACTIVE_MATERIALS_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const [startOrder, { loading: starting }] = useMutation(StartWorkOrderDocument);
  const [pauseOrder, { loading: pausing }] = useMutation(PauseWorkOrderDocument);
  const [completeOrder, { loading: completing }] = useMutation(CompleteWorkOrderDocument);
  const [uploadPhoto] = useMutation(UploadWorkOrderPhotoDocument);
  const [signWorkOrder] = useMutation(SignWorkOrderDocument);
  const [addSparePart] = useMutation(ADD_WORK_ORDER_SPARE_PART_MUTATION);
  const [addMaterial] = useMutation(ADD_WORK_ORDER_MATERIAL_MUTATION);

  // ─── Local state
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [photoAfterPreview, setPhotoAfterPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // ─── Fragment masking
  const workOrderRaw = data?.workOrder;
  const order = useFragment(WorkOrderItemFragmentDoc, workOrderRaw);
  const area = useFragment(AreaBasicFragmentDoc, order?.area);
  const machine = useFragment(MachineBasicFragmentDoc, order?.machine);

  const isAveria = order?.stopType === 'BREAKDOWN';
  const isProcessing = starting || pausing || completing;
  const isClosed =
    order?.status === 'COMPLETED' || order?.status === 'TEMPORARY_REPAIR';

  // ─── Close modal form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CloseFormValues>({
    resolver: yupResolver<CloseFormValues, any, any>(closeSchema),
    context: { isAveria },
    defaultValues: {
      finalStatus: 'COMPLETED',
      breakdownDescription: '',
      cause: '',
      actionTaken: '',
      downtimeMinutes: undefined,
      observations: '',
      toolsUsed: '',
      sparePartId: null,
      customSparePart: '',
      materialId: null,
      customMaterial: '',
    },
  });

  const watchedSparePartId = watch('sparePartId');
  const watchedMaterialId = watch('materialId');

  // ─── Cargar refacciones al abrir el modal (solo si hay máquina)
  useEffect(() => {
    if (completeOpen && order?.machineId) {
      fetchSpareParts({ variables: { machineId: order.machineId } });
    }
  }, [completeOpen, order?.machineId, fetchSpareParts]);

  // ─── Derivados
  const spareParts = (sparePartsData as any)?.sparePartsByMachine ?? [];
  const materials = (materialsData as any)?.materialsActive ?? [];

  const photoBefore = workOrderRaw?.photos?.find((p) => p.photoType === 'BEFORE');
  const photoAfterServer = workOrderRaw?.photos?.find((p) => p.photoType === 'AFTER');
  const signatures = workOrderRaw?.signatures ?? [];
  const techSignature = signatures.find(
    (s) => s.signer?.role?.name === 'TECHNICIAN' || s.signer?.roles?.some((r: any) => r.name === 'TECHNICIAN'),
  );
  const needsMySignature = isClosed && !techSignature;

  // ─── Handlers

  const handleBack = () => navigate(-1);

  const handleStartWork = async () => {
    if (!order) return;
    try {
      await startOrder({ variables: { id: order.id, input: {} } });
      await refetch();
      toast.success('Trabajo iniciado');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar el trabajo');
    }
  };

  const handlePause = async () => {
    if (!order || !pauseReason.trim()) return;
    try {
      await pauseOrder({
        variables: { id: order.id, input: { pauseReason: pauseReason.trim() } },
      });
      setPauseOpen(false);
      setPauseReason('');
      await refetch();
      toast.success('Orden pausada');
    } catch (err: any) {
      toast.error(err.message || 'Error al pausar la orden');
    }
  };

  const openCompleteModal = () => {
    reset({
      finalStatus: 'COMPLETED',
      breakdownDescription: '',
      cause: '',
      actionTaken: '',
      downtimeMinutes: undefined,
      observations: '',
      toolsUsed: '',
      sparePartId: null,
      customSparePart: '',
      materialId: null,
      customMaterial: '',
    });
    setCompleteOpen(true);
  };

  const handleConfirmCompletion = async (values: CloseFormValues) => {
    if (!order) return;
    try {
      await completeOrder({
        variables: {
          id: order.id,
          input: {
            finalStatus: values.finalStatus,
            toolsUsed: values.toolsUsed || undefined,
            customSparePart: values.sparePartId === 'OTHER' && values.customSparePart?.trim()
              ? values.customSparePart.trim()
              : undefined,
            customMaterial: values.materialId === 'OTHER' && values.customMaterial?.trim()
              ? values.customMaterial.trim()
              : undefined,
            ...(isAveria
              ? {
                  breakdownDescription: values.breakdownDescription || undefined,
                  cause: values.cause || undefined,
                  actionTaken: values.actionTaken,
                  downtimeMinutes: values.downtimeMinutes ?? undefined,
                }
              : {
                  observations: values.observations || undefined,
                }),
          },
        },
      });

      // Agregar refacción seleccionada del catálogo
      if (values.sparePartId && values.sparePartId !== 'OTHER') {
        await addSparePart({
          variables: {
            input: { workOrderId: order.id, sparePartId: values.sparePartId, quantity: 1 },
          },
        });
      }

      // Agregar material seleccionado del catálogo
      if (values.materialId && values.materialId !== 'OTHER') {
        await addMaterial({
          variables: {
            input: { workOrderId: order.id, materialId: values.materialId, quantity: 1 },
          },
        });
      }

      // Subir foto evidencia final si existe
      if (photoFile) {
        const mockPath = `uploads/${order.id}/${photoFile.name}`;
        await uploadPhoto({
          variables: {
            input: {
              workOrderId: order.id,
              fileName: photoFile.name,
              mimeType: photoFile.type,
              photoType: 'AFTER',
              filePath: mockPath,
            },
          },
        });
      }

      setCompleteOpen(false);
      await refetch();
      toast.success('Orden cerrada correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al cerrar la orden');
    }
  };

  const handlePhotoAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoAfterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSignature = async (_dataUrl: string) => {
    try {
      const mockPath = `signatures/${order?.id}/${currentUser?.id}_tech_sig.png`;
      await signWorkOrder({
        variables: { input: { workOrderId: order!.id, signatureImagePath: mockPath } },
      });
      await refetch();
      toast.success('Firma guardada');
    } catch {
      toast.error('Error al guardar la firma');
    }
  };

  // ─── Render condicional
  if (loading) return <WorkOrderDetailSkeleton />;
  if (error || !order || !workOrderRaw) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Orden no encontrada</h2>
        <Button variant="outline" onClick={handleBack}>
          Volver
        </Button>
      </div>
    );
  }

  const canEdit = order.status === 'IN_PROGRESS';

  // Datos de cierre técnico (readonly)
  const closureData = isClosed
    ? {
        breakdownDescription: workOrderRaw.breakdownDescription,
        cause: workOrderRaw.cause,
        actionTaken: workOrderRaw.actionTaken,
        toolsUsed: workOrderRaw.toolsUsed,
        downtimeMinutes: workOrderRaw.downtimeMinutes,
        observations: workOrderRaw.observations,
        customSparePart: (workOrderRaw as any).customSparePart as string | null,
        customMaterial: (workOrderRaw as any).customMaterial as string | null,
        spareParts: (workOrderRaw as any).spareParts as { id: string; quantity: number; sparePart: { partNumber: string; brand: string; model: string } }[] | null,
        materials: (workOrderRaw as any).materials as { id: string; quantity: number; material: { description: string; brand: string } }[] | null,
      }
    : null;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{order.folio}</h1>
            <StatusBadge status={order.status} />
            {order.priority && <PriorityBadge priority={order.priority} />}
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2">{order.description}</p>
        </div>
      </div>

      {/* Panel: Pendiente */}
      {order.status === 'PENDING' && (
        <Card className="bg-primary/5 border-primary/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Iniciar trabajo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Al iniciar, comenzará a registrarse el tiempo de ejecución.
                </p>
              </div>
              <Button onClick={handleStartWork} disabled={isProcessing} className="gap-2 shrink-0">
                <Play className="h-4 w-4" />
                {starting ? 'Iniciando...' : 'Iniciar Trabajo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel: En Progreso */}
      {order.status === 'IN_PROGRESS' && (
        <Card className="bg-chart-3/10 border-chart-3/30 shadow-sm">
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-5 w-5 text-chart-3" /> Trabajo en ejecución
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Al cerrar la OT podrá llenar el reporte técnico de falla.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 bg-background border-chart-3/50 hover:bg-chart-3/10"
                  onClick={() => setPauseOpen(true)}
                >
                  <Pause className="h-4 w-4" /> Pausar
                </Button>
                <Button
                  onClick={openCompleteModal}
                  disabled={isProcessing}
                  className="gap-2 bg-chart-3 hover:bg-chart-3/90 text-primary-foreground"
                >
                  <Square className="h-4 w-4" />
                  {completing ? 'Procesando...' : 'Cerrar OT'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel: Pausada */}
      {order.status === 'PAUSED' && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700">Orden Pausada</p>
                <p className="text-sm text-amber-600/80 mt-1">
                  Motivo: {workOrderRaw.pauseReason}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Solicite al Administrador que reanude esta orden cuando esté listo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel: Firma requerida */}
      {needsMySignature && (
        <Card className="bg-primary/5 border-primary/30 shadow-sm">
          <CardContent className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-foreground">Firma Requerida</h3>
              <p className="text-sm text-muted-foreground">
                La orden fue cerrada. Firme para certificar su intervención.
              </p>
            </div>
            <Button onClick={() => setIsSignModalOpen(true)} className="gap-2">
              <Pen className="h-4 w-4" /> Firmar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info general y tiempos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card shadow-sm h-min">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Datos del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {area && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Área
                </span>
                <span className="font-medium text-right">{area.name}</span>
              </div>
            )}
            {machine && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Máquina
                </span>
                <span className="font-mono bg-muted px-2 py-1 rounded">{machine.code}</span>
              </div>
            )}
            <hr className="my-2 border-border/50" />
            {order.maintenanceType && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Mantenimiento</span>
                <MaintenanceTypeBadge type={order.maintenanceType} />
              </div>
            )}
            {order.stopType && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Parada</span>
                <StopTypeBadge stopType={order.stopType} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm h-min">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" /> Cronómetro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Creada</span>
              <span>
                {new Date(order.createdAt).toLocaleString('es-MX', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 text-chart-3 font-medium">
              <span>Iniciada</span>
              <span>
                {workOrderRaw.startDate
                  ? new Date(workOrderRaw.startDate).toLocaleString('es-MX', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 text-success font-medium">
              <span>Finalizada</span>
              <span>
                {workOrderRaw.endDate
                  ? new Date(workOrderRaw.endDate).toLocaleString('es-MX', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '--'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fotos evidencia */}
      <div className="grid gap-6 md:grid-cols-2">
        {photoBefore && (
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" /> Evidencia Inicial (Antes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={`/${photoBefore.filePath}`}
                alt="Antes"
                className="w-full aspect-video rounded-lg border border-border object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            </CardContent>
          </Card>
        )}

        {(canEdit || photoAfterServer) && (
          <Card className="bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Evidencia Final (Después)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {photoAfterServer ? (
                <img
                  src={`/${photoAfterServer.filePath}`}
                  alt="Después"
                  className="w-full aspect-video rounded-lg border border-border object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              ) : photoAfterPreview ? (
                <div className="relative">
                  <img
                    src={photoAfterPreview}
                    alt="Preview"
                    className="w-full aspect-video rounded-lg border border-border object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 shadow-sm"
                    onClick={() => {
                      setPhotoAfterPreview(null);
                      setPhotoFile(null);
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 gap-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Clic para tomar o subir foto
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoAfter}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reporte técnico (readonly cuando está cerrada) */}
      {isClosed && closureData && (
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Reporte Técnico de Cierre
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm">
            {closureData.breakdownDescription && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Descripción de la falla</p>
                <p>{closureData.breakdownDescription}</p>
              </div>
            )}
            {closureData.cause && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Causa raíz</p>
                <p>{closureData.cause}</p>
              </div>
            )}
            {closureData.actionTaken && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Acción realizada</p>
                <p>{closureData.actionTaken}</p>
              </div>
            )}
            {closureData.toolsUsed && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Herramienta utilizada</p>
                <p>{closureData.toolsUsed}</p>
              </div>
            )}
            {closureData.downtimeMinutes != null && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Tiempo muerto</p>
                <p>{closureData.downtimeMinutes} min</p>
              </div>
            )}
            {closureData.observations && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Observaciones</p>
                <p>{closureData.observations}</p>
              </div>
            )}
            {closureData.spareParts && closureData.spareParts.length > 0 && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Refacciones utilizadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {closureData.spareParts.map((sp) => (
                    <Badge key={sp.id} variant="secondary" className="text-xs">
                      {sp.sparePart.brand} {sp.sparePart.model} ({sp.sparePart.partNumber})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {closureData.customSparePart && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Refacción (otra)</p>
                <p>{closureData.customSparePart}</p>
              </div>
            )}
            {closureData.materials && closureData.materials.length > 0 && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Materiales utilizados</p>
                <div className="flex flex-wrap gap-1.5">
                  {closureData.materials.map((m) => (
                    <Badge key={m.id} variant="secondary" className="text-xs">
                      {m.material.description}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {closureData.customMaterial && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Material (otro)</p>
                <p>{closureData.customMaterial}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Firma del técnico (mostrada cuando existe) */}
      {techSignature && (
        <Card className="bg-card border-border shadow-sm w-fit min-w-[250px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium text-center">
              Firma del Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <img
              src={techSignature.signatureImagePath}
              alt="Firma Técnico"
              className="h-16 object-contain"
            />
            <Badge variant="outline" className="mt-2 text-[10px] uppercase bg-muted">
              Certificado
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* ── Modal de Pausa ─────────────────────────────────────────────────── */}
      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pausar Orden de Trabajo</DialogTitle>
            <DialogDescription>
              Indica el motivo. Solo el Administrador podrá reanudarla.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Motivo de la Pausa <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Ej: Falta de refacción, espera de proveedor..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handlePause}
              disabled={!pauseReason.trim() || isProcessing}
            >
              {pausing ? 'Pausando...' : 'Confirmar Pausa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Cierre ────────────────────────────────────────────────── */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Cerrar Orden de Trabajo</DialogTitle>
            <DialogDescription>
              Complete el reporte técnico antes de cerrar la OT.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleConfirmCompletion)}>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-5 py-2">

                {/* 1. Estado final */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Estado Final</Label>
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
                          onClick={() => field.onChange('COMPLETED')}
                        >
                          <RadioGroupItem value="COMPLETED" id="status-completed" className="mt-1" />
                          <div>
                            <Label htmlFor="status-completed" className="text-sm font-semibold cursor-pointer">
                              Arreglo Definitivo (Completada)
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

                <hr className="border-border/50" />

                {/* 2. Campos según tipo de parada */}
                {isAveria ? (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Reporte de Avería
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

                <hr className="border-border/50" />

                {/* 4. Herramienta utilizada (independiente, no obligatoria) */}
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

                {/* 5. Refacciones utilizadas (solo si hay máquina) */}
                {order.machineId && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" /> Refacción utilizada
                      <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    {sparePartsLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Controller
                        name="sparePartId"
                        control={control}
                        render={({ field }) => (
                          <Combobox
                            options={[
                              { value: '', label: 'Sin refacción' },
                              ...spareParts.map((sp: any) => ({
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

                {/* 6. Materiales utilizados */}
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
                          ...materials.map((m: any) => ({
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
            </ScrollArea>

            <DialogFooter className="pt-4 border-t border-border/50 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleteOpen(false)}
                disabled={completing}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={completing}>
                {completing ? 'Guardando...' : 'Confirmar Cierre'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Firma */}
      <SignatureDialog
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
        title="Firma de Cierre (Técnico)"
      />
    </div>
  );
}
