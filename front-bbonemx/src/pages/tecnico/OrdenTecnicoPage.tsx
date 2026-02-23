import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
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
  type WorkOrderStatus
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge, StopTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignatureDialog } from '@/components/ui/signature-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft, MapPin, Wrench, FileText,
  AlertTriangle, Timer, Play, Square, Pause, ImageIcon, Pen
} from 'lucide-react';

export default function TecnicoOrdenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { data, loading, error, refetch } = useQuery(GetWorkOrderByIdDocument, { variables: { id: id! }, skip: !id, fetchPolicy: 'cache-and-network' });
  const [startOrder, { loading: starting }] = useMutation(StartWorkOrderDocument);
  const [pauseOrder, { loading: pausing }] = useMutation(PauseWorkOrderDocument);
  const [completeOrder, { loading: completing }] = useMutation(CompleteWorkOrderDocument);
  const [uploadPhoto] = useMutation(UploadWorkOrderPhotoDocument);
  const [signWorkOrder] = useMutation(SignWorkOrderDocument);

  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  
  const [completeOpen, setCompleteOpen] = useState(false);
  const [closeStatus, setCloseStatus] = useState<WorkOrderStatus>('COMPLETED' || 'TEMPORARY_REPAIR');

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  
  const [photoAfterPreview, setPhotoAfterPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [averiaForm, setAveriaForm] = useState({
    breakdownDescription: '',
    observations: '',
    cause: '',
    actionTaken: '',
    toolsUsed: '',
    downtimeMinutes: '',
  });

  const workOrderRaw = data?.workOrder;
  const order = useFragment(WorkOrderItemFragmentDoc, workOrderRaw);
  const area = useFragment(AreaBasicFragmentDoc, order?.area);
  const machine = useFragment(MachineBasicFragmentDoc, order?.machine);

  const isAveria = order?.stopType === 'BREAKDOWN';
  const canEdit = order?.status === 'IN_PROGRESS';
  const isProcessing = starting || pausing || completing;

  useEffect(() => {
    if (workOrderRaw && !averiaForm.cause && workOrderRaw.cause) {
      setAveriaForm({
        breakdownDescription: workOrderRaw.breakdownDescription || '',
        observations: workOrderRaw.observations || '',
        cause: workOrderRaw.cause || '',
        actionTaken: workOrderRaw.actionTaken || '',
        toolsUsed: workOrderRaw.toolsUsed || '',
        downtimeMinutes: workOrderRaw.downtimeMinutes?.toString() || '',
      });
    }
  }, [workOrderRaw]);

  const handleBack = () => navigate(-1);

  // 1. INICIAR TRABAJO
  const handleStartWork = async () => {
    if (!order) return;
    try {
      await startOrder({ 
        variables: { 
          id: order.id, 
          input: { 
             breakdownDescription: averiaForm.breakdownDescription || undefined 
          } 
        } 
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error al iniciar el trabajo');
    }
  };

  // 2. PAUSAR TRABAJO
  const handlePause = async () => {
    if (!order || !pauseReason.trim()) return;
    try {
      await pauseOrder({
        variables: { id: order.id, input: { pauseReason: pauseReason.trim() } },
      });
      setPauseOpen(false);
      setPauseReason('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error al pausar la orden');
    }
  };

  // 3. COMPLETAR O REPARACIÓN TEMPORAL
  const handleConfirmCompletion = async () => {
    if (!order) return;

    try {
      await completeOrder({ 
        variables: { 
          id: order.id, 
          input: {
            finalStatus: closeStatus, 
            cause: averiaForm.cause || undefined,
            actionTaken: averiaForm.actionTaken,
            toolsUsed: averiaForm.toolsUsed || undefined,
            observations: averiaForm.observations || undefined,
            downtimeMinutes: averiaForm.downtimeMinutes ? parseInt(averiaForm.downtimeMinutes) : undefined,
          } 
        } 
      });

      // 2. Subir Foto (Si existe)
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
            }
          }
        });
      }

      setCompleteOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error al completar el trabajo');
    }
  };

  // Pre-validar antes de abrir el modal de completar
  const openCompleteModal = () => {
    if (isAveria) {
      if (!averiaForm.cause.trim() || !averiaForm.actionTaken.trim() || !averiaForm.downtimeMinutes) {
        alert("Para cerrar una avería, debe llenar obligatoriamente la Causa Raíz, Acción Realizada y el Tiempo Muerto.");
        return;
      }
    }
    setCompleteOpen(true);
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
    try {
      const mockPath = `signatures/${order?.id}/${currentUser?.id}_tech_sig.png`;
      await signWorkOrder({
        variables: { input: { workOrderId: order!.id, signatureImagePath: mockPath } }
      });
      refetch();
    } catch (error) {
      alert("Hubo un error al guardar la firma.");
    }
  };

  // Renderizados
  if (loading) return <WorkOrderDetailSkeleton />;
  if (error || !order || !workOrderRaw) {
    return (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Orden no encontrada</h2>
          <Button variant="outline" onClick={handleBack}>Volver</Button>
        </div>
    );
  }

  const photoBefore = workOrderRaw.photos?.find(p => p.photoType === 'BEFORE');
  const photoAfterServer = workOrderRaw.photos?.find(p => p.photoType === 'AFTER');
  
  const signatures = workOrderRaw.signatures || [];
  const techSignature = signatures.find(s => s.signer.role.name === 'TECHNICIAN');
  
  const isClosed = order.status === 'COMPLETED' || order.status === 'TEMPORARY_REPAIR';
  const needsMySignature = isClosed && !techSignature;

  return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
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

        {/* Panel de Acción: Pendiente */}
        {order.status === 'PENDING' && (
          <Card className="bg-primary/5 border-primary/30 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Iniciar trabajo</h3>
                  <p className="text-sm text-muted-foreground mt-1">Al iniciar, comenzará a registrarse el tiempo de ejecución (MTTR).</p>
                </div>
                <Button onClick={handleStartWork} disabled={isProcessing} className="gap-2 shrink-0">
                  <Play className="h-4 w-4" /> {starting ? 'Iniciando...' : 'Iniciar Trabajo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panel de Acción: En Progreso */}
        {order.status === 'IN_PROGRESS' && (
          <Card className="bg-chart-3/10 border-chart-3/30 shadow-sm">
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Timer className="h-5 w-5 text-chart-3" /> Trabajo en ejecución
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Llene los datos de avería (si aplica) antes de finalizar la orden.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 bg-background border-chart-3/50 hover:bg-chart-3/10" onClick={() => setPauseOpen(true)}>
                    <Pause className="h-4 w-4" /> Pausar
                  </Button>
                  <Button onClick={openCompleteModal} disabled={isProcessing} className="gap-2 bg-chart-3 hover:bg-chart-3/90 text-primary-foreground">
                    <Square className="h-4 w-4" /> {completing ? 'Procesando...' : 'Cerrar OT'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panel de Acción: Pausada */}
        {order.status === 'PAUSED' && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">Orden Pausada</p>
                  <p className="text-sm text-amber-600/80 mt-1">Motivo: {workOrderRaw.pauseReason}</p>
                  <p className="text-xs text-muted-foreground mt-1">Debe solicitar al Administrador que reanude esta orden cuando esté listo para continuar.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panel de Firma */}
        {needsMySignature && (
          <Card className="bg-primary/5 border-primary/30 shadow-sm">
            <CardContent className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground">Firma Requerida</h3>
                <p className="text-sm text-muted-foreground">La orden fue cerrada, firme para certificar su intervención.</p>
              </div>
              <Button onClick={() => setIsSignModalOpen(true)} className="gap-2">
                <Pen className="h-4 w-4" /> Firmar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ... Info General y Tiempos ... */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Información General */}
          <Card className="bg-card shadow-sm h-min">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Datos del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {area && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Área</span>
                  <span className="font-medium text-right">{area.name}</span>
                </div>
              )}
              {machine && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Wrench className="h-4 w-4" /> Máquina</span>
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

          {/* Tiempos */}
          <Card className="bg-card shadow-sm h-min">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> Cronómetro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Creada</span>
                <span>{new Date(order.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-chart-3 font-medium">
                <span>Iniciada</span>
                <span>{workOrderRaw.startDate ? new Date(workOrderRaw.startDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '--'}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-success font-medium">
                <span>Finalizada</span>
                <span>{workOrderRaw.endDate ? new Date(workOrderRaw.endDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '--'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fotos Evidencia */}
        <div className="grid gap-6 md:grid-cols-2">
          {photoBefore && (
            <Card className="bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> Evidencia Inicial (Antes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img src={`/${photoBefore.filePath}`} alt="Antes" className="w-full aspect-video rounded-lg border border-border object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </CardContent>
            </Card>
          )}

          {/* Subir Foto (Solo si puede editar o ya la subió) */}
          {(canEdit || photoAfterServer) && (
            <Card className="bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" /> Evidencia Final (Después)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {photoAfterServer ? (
                  <img src={`/${photoAfterServer.filePath}`} alt="Después" className="w-full aspect-video rounded-lg border border-border object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : photoAfterPreview ? (
                  <div className="relative">
                    <img src={photoAfterPreview} alt="Preview" className="w-full aspect-video rounded-lg border border-border object-cover" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 shadow-sm" onClick={() => { setPhotoAfterPreview(null); setPhotoFile(null); }}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 gap-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Clic para tomar o subir foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoAfter} />
                  </label>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Formulario de Avería (Editable si está en progreso) */}
        {isAveria && (canEdit || isClosed) && (
          <Card className="bg-card shadow-sm border-destructive/20">
            <CardHeader className="pb-3 border-b border-border/50 bg-destructive/5">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Reporte Técnico de Falla
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label>Descripción técnica de la Falla (Opcional)</Label>
                <Textarea value={averiaForm.breakdownDescription} onChange={(e) => setAveriaForm((p) => ({ ...p, breakdownDescription: e.target.value }))} disabled={!canEdit} placeholder="Detalle técnico de lo que se encontró fallando..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Causa Raíz {canEdit && <span className="text-destructive">*</span>}</Label>
                  <Textarea value={averiaForm.cause} onChange={(e) => setAveriaForm((p) => ({ ...p, cause: e.target.value }))} disabled={!canEdit} placeholder="Motivo que originó la falla..." />
                </div>
                <div className="space-y-2">
                  <Label>Acción Realizada {canEdit && <span className="text-destructive">*</span>}</Label>
                  <Textarea value={averiaForm.actionTaken} onChange={(e) => setAveriaForm((p) => ({ ...p, actionTaken: e.target.value }))} disabled={!canEdit} placeholder="Trabajo ejecutado para reparar..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Herramientas y Materiales Utilizados</Label>
                <Input value={averiaForm.toolsUsed} onChange={(e) => setAveriaForm((p) => ({ ...p, toolsUsed: e.target.value }))} disabled={!canEdit} placeholder="Ej: Llave 10mm, Balero mod. 50..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tiempo Muerto de Máquina {canEdit && <span className="text-destructive">*</span>}</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="0" value={averiaForm.downtimeMinutes} onChange={(e) => setAveriaForm((p) => ({ ...p, downtimeMinutes: e.target.value }))} disabled={!canEdit} className="w-32" placeholder="0" />
                    <span className="text-sm text-muted-foreground">Minutos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observaciones Adicionales</Label>
                  <Input value={averiaForm.observations} onChange={(e) => setAveriaForm((p) => ({ ...p, observations: e.target.value }))} disabled={!canEdit} placeholder="Notas extra..." />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Firma del Técnico Mostrada */}
        {techSignature && (
          <Card className="bg-card border-border shadow-sm w-fit min-w-[250px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium text-center">Firma del Técnico</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img src={techSignature.signatureImagePath} alt="Firma Técnico" className="h-16 object-contain" />
              <Badge variant="outline" className="mt-2 text-[10px] uppercase bg-muted">Certificado</Badge>
            </CardContent>
          </Card>
        )}

        {/* Modal de Pausa */}
        <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pausar Orden de Trabajo</DialogTitle>
              <DialogDescription>Indica el motivo. Solo el Administrador podrá reanudarla.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Motivo de la Pausa *</Label>
                <Textarea value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} placeholder="Ej: Falta de refacción, espera de proveedor..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPauseOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handlePause} disabled={!pauseReason.trim() || isProcessing}>
                {pausing ? 'Pausando...' : 'Confirmar Pausa'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Finalización (Elegir Estado) */}
        <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Trabajo</DialogTitle>
              <DialogDescription>Seleccione el estado final de la máquina tras su intervención.</DialogDescription>
            </DialogHeader>
            <div>
              <RadioGroup 
                value={closeStatus} 
                onValueChange={(val) => setCloseStatus(val as WorkOrderStatus)}
                className="grid gap-4"
              >
                <div className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setCloseStatus('COMPLETED')}>
                  <RadioGroupItem value={'COMPLETED'} id="status-completed" className="mt-1" />
                  <div>
                    <Label htmlFor="status-completed" className="text-base font-semibold cursor-pointer">Arreglo Definitivo (Completada)</Label>
                    <p className="text-sm text-muted-foreground">La máquina quedó reparada y en óptimas condiciones de operación.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 border border-amber-500/30 bg-amber-500/5 p-4 rounded-lg hover:bg-amber-500/10 cursor-pointer" onClick={() => setCloseStatus('TEMPORARY_REPAIR')}>
                  <RadioGroupItem value={'TEMPORARY_REPAIR'} id="status-temp" className="mt-1" />
                  <div>
                    <Label htmlFor="status-temp" className="text-base font-semibold text-amber-700 cursor-pointer">Reparación Temporal (Parche)</Label>
                    <p className="text-sm text-muted-foreground">La máquina funciona, pero requiere una intervención o refacción definitiva posterior.</p>
                  </div>
                </div>
              </RadioGroup>
              {!isAveria && (
                <div className="pt-6">
                  <Label className="text-base font-semibold cursor-pointer">Acción realizada</Label>
                  <Textarea value={averiaForm.actionTaken} onChange={(e) => setAveriaForm((p) => ({ ...p, actionTaken: e.target.value }))} disabled={!canEdit} placeholder="Describe las acciones realizadas para reparar la avería" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmCompletion} disabled={isProcessing}>
                {completing ? 'Guardando...' : 'Confirmar Cierre'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Firma */}
        <SignatureDialog isOpen={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} onSave={handleSaveSignature} title="Firma de Cierre (Técnico)" />
      </div>
  );
}