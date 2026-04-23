import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';
import {
  GetWorkOrderByIdDocument,
  SignWorkOrderDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  UserBasicFragmentDoc,
  type WorkOrderSignature,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { RESPOND_CONFORMITY_MUTATION } from '@/lib/graphql/operations/work-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SignatureDialog } from '@/components/ui/signature-dialog';
import { ConformityDialog, type ConformityFormValues } from '@/components/ui/conformity-dialog';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import {
  ArrowLeft, Calendar, MapPin, Clock, Wrench, FileText,
  CheckCircle, AlertTriangle, Settings, Pen, User, Building2, ClipboardCheck,
} from 'lucide-react';
import { resolveBackendAssetUrl, uploadFileToBackend, dataUrlToFile } from '@/lib/utils/uploads';
import { toast } from 'sonner';

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isConformityOpen, setIsConformityOpen] = useState(false);
  const [conformityLoading, setConformityLoading] = useState(false);

  const { data, loading, refetch } = useQuery(GetWorkOrderByIdDocument, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const [signWorkOrder] = useMutation(SignWorkOrderDocument);
  const [respondConformity] = useMutation(RESPOND_CONFORMITY_MUTATION);

  const workOrderRaw = (data as unknown as { workOrder?: Record<string, unknown> })?.workOrder;
  const order = unmaskFragment(WorkOrderItemFragmentDoc, workOrderRaw);

  const area = unmaskFragment(AreaBasicFragmentDoc, order?.area);
  const subArea = unmaskFragment(SubAreaBasicFragmentDoc, order?.subArea)
  const machine = unmaskFragment(MachineBasicFragmentDoc, order?.machine)

  const leadTechRel = order?.technicians?.find(t => t.isLead);
  const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);
  const requester = (workOrderRaw as { requester?: { id: string; roles?: { name: string }[] } })?.requester;

  const handleBack = () => navigate(-1);

  const handleSaveSignature = async (dataURL: string) => {
    try {
      if (!order?.id) throw new Error("Order ID is missing");
      const file = await dataUrlToFile(dataURL, `signature_${order.id}_${user?.id}.png`);
      const uploadRes = await uploadFileToBackend(file);

      await signWorkOrder({
        variables: {
          input: {
            signatureImagePath: uploadRes.url,
            workOrderId: order.id,
          }
        }
      });

      await refetch();
      toast.success('Firma guardada');
      setIsSignModalOpen(false);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Error al guardar la firma');
    }
  };

  if (loading) return <WorkOrderDetailSkeleton />;


  if (!order || !workOrderRaw) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Orden no encontrada</h2>
        <p className="text-muted-foreground mb-4">La orden solicitada no existe o no tienes acceso.</p>
        <Button variant="outline" className="bg-transparent" onClick={handleBack}>Volver</Button>
      </div>
    );
  }



  const handleConformitySubmit = async (values: ConformityFormValues) => {
    setConformityLoading(true);
    try {
      await respondConformity({
        variables: {
          input: {
            workOrderId: order?.id,
            question1Answer: values.question1Answer,
            question2Answer: values.question2Answer,
            question3Answer: values.question3Answer,
            isConforming: values.isConforming,
            reason: values.reason ?? null,
          },
        },
      });
      await refetch();
      if (values.isConforming) {
        toast.success('Conformidad confirmada. Firma la orden para continuar.');
        setIsSignModalOpen(true);
      } else {
        toast.info('No conformidad registrada. La orden ha sido regresada a los técnicos.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al responder conformidad';
      toast.error(msg);
      throw err;
    } finally {
      setConformityLoading(false);
    }
  };

  const signatures = (workOrderRaw as { signatures?: WorkOrderSignature[] })?.signatures || [];
  const requesterIsAdmin = requester?.roles?.some((role: { name: string }) => role.name === 'ADMIN') ?? false;
  const requesterSignature = signatures.find((s: WorkOrderSignature) => s.signer.id === requester?.id);
  const leadTechnicianId = leadTechnician?.id;
  const technicianSignature = signatures.find(
    (s: WorkOrderSignature) => leadTechnicianId && s.signer.id === leadTechnicianId,
  );
  const adminSignature = signatures.find((s: WorkOrderSignature) => {
    if (s.signer.id === requester?.id) return false;
    if (leadTechnicianId && s.signer.id === leadTechnicianId) return false;
    return s.signer.roles?.some((role: { name: string }) => role.name === 'ADMIN');
  });

  const isFinishedOrRepair = order.status === 'FINISHED' || order.status === 'TEMPORARY_REPAIR';
  const pendingConformity = (workOrderRaw as { pendingConformity?: boolean })?.pendingConformity ?? false;
  const conformityCycleCount = (workOrderRaw as { conformityCycleCount?: number })?.conformityCycleCount ?? 0;

  // Muestra cuestionario cuando OT finalizada y aún pendiente de conformidad
  const needsConformity = isFinishedOrRepair && pendingConformity;
  // Muestra botón de firma solo cuando ya pasó conformidad y aún no ha firmado
  const needsMySignature = isFinishedOrRepair && !pendingConformity && !requesterSignature;

  const photoBefore = (workOrderRaw as { photos?: Array<{ photoType: string; filePath: string }> })?.photos?.find(p => p.photoType === 'BEFORE');
  const photoAfter = (workOrderRaw as { photos?: Array<{ photoType: string; filePath: string }> })?.photos?.find(p => p.photoType === 'AFTER');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Volver" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{order.folio}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1">{order.description}</p>
        </div>
      </div>

      {/* Conformidad pendiente */}
      {needsConformity && (
        <Card className="bg-amber-500/5 border-amber-500/40 shadow-sm animate-in slide-in-from-top-2">
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Evaluación de conformidad requerida
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  La orden ha sido completada. Responde el cuestionario de conformidad antes de firmar.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 shrink-0 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 bg-transparent"
                onClick={() => setIsConformityOpen(true)}
              >
                <ClipboardCheck className="h-4 w-4" />
                Responder conformidad
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign prompt for solicitante */}
      {needsMySignature && (
        <Card className="bg-primary/5 border-primary/30 shadow-sm animate-in slide-in-from-top-2">
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle className='h-4 w-4 text-primary' aria-hidden="true" />Firma requerida</h3>
                <p className="text-sm text-muted-foreground mt-1">Conformidad confirmada. Por favor valide y firme la orden.</p>
              </div>
              <Button className="gap-2 shrink-0" onClick={() => setIsSignModalOpen(true)}>
                <Pen className="h-4 w-4" />
                Firmar orden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pause info */}
      {order.status === 'PAUSED' && (workOrderRaw as { pauseReason?: string })?.pauseReason && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-500">Orden en pausa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* General info */}
        <Card className="bg-card shadow-sm">
          <CardHeader className=" border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Informacion General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {area && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-3 w-3" /> Area</span>
                <span className="text-medium text-right">{area?.name}</span>
              </div>
            )}
            {subArea && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-3 w-3" /> Sub-area</span>
                <span className="text-right">{subArea?.name}</span>
              </div>
            )}
            {machine && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1"><Wrench className="h-3 w-3" /> Equipo/Estructura</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{machine?.name}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Settings className="h-3 w-3" /> Estado</span>
              <StatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Linea de Tiempo
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm relative">
            <div className="absolute left-6 top-8 bottom-4 w-px bg-border z-0"></div>

            <div className="flex gap-4 relative z-10">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border-2 border-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="pt-1.5">
                <p className="font-medium leading-none">Solicitud Creada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleString('es-MX')}
                </p>
              </div>
            </div>

            {(workOrderRaw as { startDate?: string })?.startDate && (
              <div className="flex gap-4 relative z-10">
                <div className="h-8 w-8 rounded-full bg-chart-3/20 flex items-center justify-center shrink-0 border-2 border-background">
                  <Wrench className="h-4 w-4 text-chart-3" />
                </div>
                <div className="pt-1.5">
                  <p className="font-medium leading-none">Trabajo Iniciado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date((workOrderRaw as { startDate: string }).startDate).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            )}

            {(workOrderRaw as { endDate?: string })?.endDate && (
              <div className="flex gap-4 relative z-10">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-2 border-background">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="pt-1.5">
                  <p className="font-medium leading-none">Trabajo Finalizado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date((workOrderRaw as { endDate: string }).endDate).toLocaleString('es-MX')}
                  </p>
                  {(workOrderRaw as { downtimeMinutes?: number })?.downtimeMinutes && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      Tiempo muerto: {(workOrderRaw as { downtimeMinutes: number }).downtimeMinutes} min
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {leadTechnician && (
        <Card className="bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Técnico Líder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0" aria-hidden="true">
                <span className="font-bold text-primary text-sm leading-none">
                  {leadTechnician.firstName?.[0]}{leadTechnician.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{leadTechnician.firstName} {leadTechnician.lastName}</p>
                <p className="text-sm text-muted-foreground">{leadTechnician.employeeNumber || 'Técnico'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Photos */}
      {(photoBefore || photoAfter) && (
        <Card className="bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base">Evidencia Fotográfica</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {photoBefore && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive"></span> Antes
                  </p>
                  {/* Reemplaza con lógica real de mostrar imagen basada en filePath */}
                  <div className="aspect-video w-full rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img src={resolveBackendAssetUrl(photoBefore.filePath)} alt="Antes" width={1280} height={720} className="object-cover w-full h-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="text-muted-foreground text-xs absolute">Imagen no disponible</span>
                  </div>
                </div>
              )}
              {photoAfter && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success"></span> Después
                  </p>
                  <div className="aspect-video w-full rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img src={resolveBackendAssetUrl(photoAfter.filePath)} alt="Después" width={1280} height={720} className="object-cover w-full h-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="text-muted-foreground text-xs absolute">Imagen no disponible</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures (when completed) */}
      {(order.status === 'COMPLETED' || isFinishedOrRepair || signatures.length > 0) && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pen className="h-4 w-4 text-primary" /> Conformidad y Firmas
            </CardTitle>
            {order.isFullySigned && <Badge variant="default" className="bg-success hover:bg-success">Completamente Firmada</Badge>}
          </CardHeader>
          <CardContent className="pt-6">
            <div className={`grid gap-4 ${requesterIsAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>

              {/* Solicitante */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-muted/10 h-32">
                <p className="text-sm font-medium text-muted-foreground mb-3">Solicitante</p>
                {requesterSignature ? (
                  <img src={resolveBackendAssetUrl(requesterSignature.signatureImagePath)} alt="Firma" width={200} height={48} className="h-12 object-contain" />
                ) : needsConformity ? (
                  <Button variant="outline" size="sm" className="bg-transparent border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10" onClick={() => setIsConformityOpen(true)}>
                    <ClipboardCheck className="h-3 w-3 mr-2" /> Conformidad
                  </Button>
                ) : needsMySignature ? (
                  <Button variant="outline" size="sm" className="bg-background shadow-sm" onClick={() => setIsSignModalOpen(true)}>
                    <Pen className="h-3 w-3 mr-2" /> Firmar
                  </Button>
                ) : (
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Pendiente</span>
                )}
              </div>

              {/* Técnico */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-muted/10 h-32">
                <p className="text-sm font-medium text-muted-foreground mb-3">Técnico</p>
                {technicianSignature ? (
                  <img src={resolveBackendAssetUrl(technicianSignature.signatureImagePath)} alt="Firma" width={200} height={48} className="h-12 object-contain" />
                ) : (
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Pendiente</span>
                )}
              </div>

              {!requesterIsAdmin && (
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-muted/10 h-32">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Administrador</p>
                  {adminSignature ? (
                    <img src={resolveBackendAssetUrl(adminSignature.signatureImagePath)} alt="Firma" width={200} height={48} className="h-12 object-contain" />
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Pendiente</span>
                  )}
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Dialog */}
      <SignatureDialog
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
      />

      {/* Conformity Dialog */}
      <ConformityDialog
        isOpen={isConformityOpen}
        onClose={() => setIsConformityOpen(false)}
        onSubmit={handleConformitySubmit}
        cycleNumber={conformityCycleCount + 1}
        isLoading={conformityLoading}
      />

    </div>
  );
}
