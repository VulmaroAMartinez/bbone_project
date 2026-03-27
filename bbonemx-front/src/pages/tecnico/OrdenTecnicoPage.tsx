import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';

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
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';
import type { GetWorkOrderByIdQuery } from '@/lib/graphql/generated/graphql';

import {
  ADD_WORK_ORDER_SPARE_PART_MUTATION,
  ADD_WORK_ORDER_MATERIAL_MUTATION,
} from '@/lib/graphql/operations/work-orders';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge, StopTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import { SignatureDialog } from '@/components/ui/signature-dialog';
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
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveBackendAssetUrl, uploadFileToBackend } from '@/lib/utils/uploads';

import { PauseModal } from './modals/PauseModal';
import { CompleteModal, type CloseFormValues } from './modals/CompleteModal';

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

  const [startOrder, { loading: starting }] = useMutation(StartWorkOrderDocument);
  const [pauseOrder, { loading: pausing }] = useMutation(PauseWorkOrderDocument);
  const [completeOrder, { loading: completing }] = useMutation(CompleteWorkOrderDocument);
  const [uploadPhoto] = useMutation(UploadWorkOrderPhotoDocument);
  const [signWorkOrder] = useMutation(SignWorkOrderDocument);
  const [addSparePart] = useMutation(ADD_WORK_ORDER_SPARE_PART_MUTATION);
  const [addMaterial] = useMutation(ADD_WORK_ORDER_MATERIAL_MUTATION);

  // ─── Local state
  const [pauseOpen, setPauseOpen] = useState(false);
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

  const photoBefore = workOrderRaw?.photos?.find((p) => p.photoType === 'BEFORE');
  const photoAfterServer = workOrderRaw?.photos?.find((p) => p.photoType === 'AFTER');
  const signatures = workOrderRaw?.signatures ?? [];
  const techSignature = signatures.find(
    (s) => s.signer?.role?.name === 'TECHNICIAN' || s.signer?.roles?.some((r: { name: string }) => r.name === 'TECHNICIAN'),
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar el trabajo');
    }
  };

  const handlePause = async (reason: string) => {
    if (!order) return;
    try {
      await pauseOrder({
        variables: { id: order.id, input: { pauseReason: reason } },
      });
      setPauseOpen(false);
      await refetch();
      toast.success('Orden pausada');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al pausar la orden');
    }
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
        const uploadedPhoto = await uploadFileToBackend(photoFile);
        await uploadPhoto({
          variables: {
            input: {
              workOrderId: order.id,
              fileName: photoFile.name,
              mimeType: photoFile.type,
              photoType: 'AFTER',
              filePath: uploadedPhoto.url,
            },
          },
        });
      }

      setCompleteOpen(false);
      await refetch();
      toast.success('Orden cerrada correctamente');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cerrar la orden');
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

  const handleSaveSignature = async (dataUrl: string) => {
    void dataUrl;
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
  type WorkOrderRaw = NonNullable<GetWorkOrderByIdQuery['workOrder']>;
  type ClosureExtras = Pick<WorkOrderRaw, 'customSparePart' | 'customMaterial' | 'spareParts' | 'materials'>;

  const closureData = isClosed
    ? {
        breakdownDescription: workOrderRaw.breakdownDescription,
        cause: workOrderRaw.cause,
        actionTaken: workOrderRaw.actionTaken,
        toolsUsed: workOrderRaw.toolsUsed,
        downtimeMinutes: workOrderRaw.downtimeMinutes,
        observations: workOrderRaw.observations,
        customSparePart: (workOrderRaw as ClosureExtras).customSparePart ?? null,
        customMaterial: (workOrderRaw as ClosureExtras).customMaterial ?? null,
        spareParts: (workOrderRaw as ClosureExtras).spareParts ?? null,
        materials: (workOrderRaw as ClosureExtras).materials ?? null,
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
                  onClick={() => setCompleteOpen(true)}
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
                  <Wrench className="h-4 w-4" /> Equipo/Estructura
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
                src={resolveBackendAssetUrl(photoBefore.filePath)}
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
                  src={resolveBackendAssetUrl(photoAfterServer.filePath)}
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
      <PauseModal
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onConfirm={handlePause}
        isPausing={pausing}
      />

      {/* ── Modal de Cierre ────────────────────────────────────────────────── */}
      <CompleteModal
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        isAveria={!!isAveria}
        machineId={order?.machineId}
        onConfirm={handleConfirmCompletion}
        isCompleting={completing}
      />

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
