import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useAuth } from '@/contexts/auth-context';

import {
  GetWorkOrderByIdDocument,
  GetTechniciansDocument,
  GetShiftsDocument,
  GetMachinesDocument,
  UpdateWorkOrderDocument,
  SignWorkOrderDocument,
  ResumeWorkOrderDocument,
  AssignWorkOrderDocument,
  type MaintenanceType,
  type WorkOrderPriority,
  type StopType,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  TechnicianBasicFragmentDoc,
  UserBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge, StopTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import { SignatureDialog } from '@/components/ui/signature-dialog';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Wrench,
  FileText,
  AlertTriangle,
  Settings,
  UserPlus,
  Play,
  Pen,
  CheckCircle,
  Trash2,
} from 'lucide-react';

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
  { value: 'BREAKDOWN', label: 'Avería' },
  { value: 'OTHER', label: 'Otro' },
];

function AdminOrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manageOpen, setManageOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [resumeConfirmOpen, setResumeConfirmOpen] = useState(false);
  const [auxiliaryTechnicians, setAuxiliaryTechnicians] = useState<string[]>([]);

  const [mgmt, setMgmt] = useState({
    priority: undefined as WorkOrderPriority | undefined,
    stoppageType: undefined as StopType | undefined,
    shiftId: '',
    maintenanceType: undefined as MaintenanceType | undefined,
    machineId: '',
    leadTechnicianId: '',
  })

  const { data, loading, error, refetch } = useQuery(GetWorkOrderByIdDocument, { variables: { id: id! }, skip: !id });
  const { data: techData } = useQuery(GetTechniciansDocument);
  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const [getMachines, { data: machinesData }] = useLazyQuery(GetMachinesDocument);

  const [updateOrder, { loading: updating }] = useMutation(UpdateWorkOrderDocument);
  const [assignOrder, { loading: assigning }] = useMutation(AssignWorkOrderDocument);
  const [resumeOrder, { loading: resuming }] = useMutation(ResumeWorkOrderDocument);
  const [signWorkOrder] = useMutation(SignWorkOrderDocument);

  const workOrderRaw = data?.workOrder;
  const order = unmaskFragment(WorkOrderItemFragmentDoc, workOrderRaw);

  const area = unmaskFragment(AreaBasicFragmentDoc, order?.area);
  const subArea = unmaskFragment(SubAreaBasicFragmentDoc, order?.subArea);
  const machine = unmaskFragment(MachineBasicFragmentDoc, order?.machine);
  const requester = unmaskFragment(UserBasicFragmentDoc, order?.requester);

  const leadTechRel = order?.technicians?.find(t => t.isLead);
  const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);

  const shifts = shiftsData?.shiftsActive || [];
  const technicians = unmaskFragment(TechnicianBasicFragmentDoc, techData?.techniciansActive || []);
  const availableMachines = unmaskFragment(MachineBasicFragmentDoc, machinesData?.machinesActive?.filter(m => m.subAreaId === subArea?.id) || []);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    if (subArea?.id && manageOpen) {
      getMachines();
    }
  }, [subArea?.id, manageOpen, getMachines]);

  const openManageDialog = () => {
    if (order) {
      const auxTechs = order.technicians
        ?.filter(t => !t.isLead)
        .map(t => unmaskFragment(UserBasicFragmentDoc, t.technician)?.id || '') || [];

      setMgmt({
        priority: order.priority || undefined,
        stoppageType: order.stopType || undefined,
        shiftId: order.assignedShiftId || '',
        maintenanceType: order.maintenanceType || undefined,
        machineId: order.machineId || '',
        leadTechnicianId: leadTechnician?.id || '',
      });
      setAuxiliaryTechnicians(auxTechs);
    }
    setManageOpen(true);
  };

  const handleSaveManagement = async () => {
    if (!order) return;

    try {


      if (order.status === 'PENDING' || order.status === 'TEMPORARY_REPAIR') {
        if (!mgmt.leadTechnicianId) {
          throw new Error("Debe seleccionar un Técnico Líder para asignar la orden.");
        }

        const cleanAuxTechnicians = auxiliaryTechnicians.filter(tId => tId !== '');
        const allTechnicianIds = Array.from(new Set([mgmt.leadTechnicianId, ...cleanAuxTechnicians])).filter(Boolean);

        await assignOrder({
          variables: {
            id: order.id,
            input: {
              priority: mgmt.priority!,
              maintenanceType: mgmt.maintenanceType!,
              stopType: mgmt.stoppageType!,
              assignedShiftId: mgmt.shiftId || undefined,
              leadTechnicianId: mgmt.leadTechnicianId,
              technicianIds: allTechnicianIds,
              machineId: mgmt.machineId || undefined
            }
          }
        });

      } else {

        await updateOrder({
          variables: {
            id: order.id,
            input: {
              priority: mgmt.priority,
              stopType: mgmt.stoppageType,
              assignedShiftId: mgmt.shiftId || undefined,
              maintenanceType: mgmt.maintenanceType,
              machineId: mgmt.machineId || undefined,
            },
          },
        });

      }

      setManageOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Error updating order:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || "Error al actualizar la orden.";
      alert(errorMessage);
    }
  };

  const handleResumeFromPause = async () => {
    if (!order) return;
    try {
      await resumeOrder({ variables: { id: order.id } });
      refetch();
    } catch (err: any) {
      console.error('Error resuming order:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || "Error al reanudar la orden.";
      alert(errorMessage);
    }
  }

  const handleSaveSignature = async (dataURL: string) => {
    try {
      const mockPath = `signatures/${order?.id}/${user?.id}_sig.png`;

      await signWorkOrder({
        variables: {
          input: {
            signatureImagePath: mockPath,
            workOrderId: order?.id!,
          }
        }
      });
      await refetch();
    } catch (error: any) {
      console.error('Error saving signature:', error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message || "Error al guardar la firma.";
      alert(errorMessage);
    }
  }

  if (loading) return <WorkOrderDetailSkeleton />;

  if (error || !order || !workOrderRaw) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Orden no encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error?.message || 'La orden de trabajo no existe'}</p>
          <Button className="mt-4 bg-transparent" variant="outline" onClick={handleBack}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Variables de UI
  const isPending = order.status === 'PENDING';
  const isCompleted = order.status === 'COMPLETED';
  const isTemporaryRepair = order.status === 'TEMPORARY_REPAIR';
  const showMachineField = mgmt.stoppageType === 'BREAKDOWN' || !!subArea?.id;

  // Firmas
  const signatures = workOrderRaw.signatures || [];
  const adminSignature = signatures.find(s => s.signer.role.name === 'ADMIN');
  const needsMySignature = (isCompleted || isTemporaryRepair) && !adminSignature;

  // Fotos
  const photoBefore = workOrderRaw.photos?.find(p => p.photoType === 'BEFORE');
  const photoAfter = workOrderRaw.photos?.find(p => p.photoType === 'AFTER');
  const isProcessing = updating || assigning;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Volver">
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

      {/* Action buttons del Admin */}
      <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        {order.status !== 'COMPLETED' && order.status !== 'TEMPORARY_REPAIR' && (
          <Button onClick={openManageDialog} className="gap-2 shadow-sm">
            <Settings className="h-4 w-4" />
            Gestionar OT {isPending ? 'y Asignar' : ''}
          </Button>
        )}
        {order.status === 'PAUSED' && (
          <Button onClick={() => setResumeConfirmOpen(true)} disabled={resuming} variant="secondary" className="gap-2">
            <Play className="h-4 w-4" />
            {resuming ? 'Reanudando...' : 'Forzar Reanudación'}
          </Button>
        )}
        {needsMySignature && (
          <Button onClick={() => setIsSignModalOpen(true)} className="gap-2 bg-success hover:bg-success/90 text-success-foreground shadow-sm">
            <Pen className="h-4 w-4" />
            Firmar como Administrador
          </Button>
        )}
      </div>

      {/* Banner de Pausa */}
      {order.status === 'PAUSED' && workOrderRaw.pauseReason && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700">Orden en pausa</p>
                <p className="text-sm text-amber-600/80 mt-1">Razón: {workOrderRaw.pauseReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Columna principal (izquierda) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-card shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" /> Datos de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Descripción reportada
              </p>
              <p className="text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md border border-border/50">
                {order.description}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Área</p>
                <p className="font-medium text-foreground">{area?.name}</p>
              </div>
              {subArea && (
                <div>
                  <p className="text-muted-foreground">Sub-área</p>
                  <p className="font-medium text-foreground">{subArea.name}</p>
                </div>
              )}
            </div>
            {photoBefore && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Evidencia inicial (Antes)
                </p>
                <img
                  src={`/${photoBefore.filePath}`}
                  alt="Antes"
                  width={800}
                  height={256}
                  className="max-h-64 rounded-lg border border-border object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5 text-primary" /> Parámetros de Gestión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Prioridad</span>
                {order.priority ? (
                  <PriorityBadge priority={order.priority} />
                ) : (
                  <span className="text-muted-foreground italic">--</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo de parada</span>
                {order.stopType ? (
                  <StopTypeBadge stopType={order.stopType} />
                ) : (
                  <span className="text-muted-foreground italic">--</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo de mantenimiento</span>
                {order.maintenanceType ? (
                  <MaintenanceTypeBadge type={order.maintenanceType} />
                ) : (
                  <span className="text-muted-foreground italic">--</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Máquina</span>
                <span className="font-medium">
                  {machine ? `${machine.name} [${machine.code}]` : '--'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporte de cierre técnico */}
        {workOrderRaw.endDate && (
          <Card className="bg-card shadow-sm border-primary/20">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-5 w-5 text-primary" /> Reporte de Cierre
                Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {order.stopType === 'BREAKDOWN' || order.stopType === 'OTHER' && (
                <div className="grid md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
                  {workOrderRaw.cause && (
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">
                        Causa Raíz
                      </p>
                      <p>{workOrderRaw.cause}</p>
                    </div>
                  )}
                  {workOrderRaw.actionTaken && (
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">
                        Acción Realizada
                      </p>
                      <p>{workOrderRaw.actionTaken}</p>
                    </div>
                  )}
                  {workOrderRaw.toolsUsed && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground font-medium mb-1">
                        Herramientas / Materiales
                      </p>
                      <p>{workOrderRaw.toolsUsed}</p>
                    </div>
                  )}
                </div>
              )}
              {workOrderRaw.observations && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">
                    Observaciones Generales
                  </p>
                  <p className="bg-muted p-3 rounded-md">
                    {workOrderRaw.observations}
                  </p>
                </div>
              )}
              {photoAfter && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Evidencia Final (Después)
                  </p>
                  <img
                    src={`/${photoAfter.filePath}`}
                    alt="Después"
                    width={800}
                    height={192}
                    className="max-h-48 rounded-lg border border-border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        {/* Columna lateral (derecha) */}
        <div className="space-y-6 lg:col-start-3">
          <Card className="bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-primary" /> Tiempos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={<Calendar className="text-muted-foreground" />}
                  label="Creada"
                  date={order.createdAt}
                />
                {workOrderRaw.startDate && (
                  <TimelineItem
                    icon={<Play className="text-chart-3" />}
                    label="Iniciada"
                    date={workOrderRaw.startDate}
                  />
                )}
                {workOrderRaw.endDate && (
                  <>
                    <TimelineItem
                      icon={<CheckCircle className="text-success" />}
                      label="Finalizada"
                      date={workOrderRaw.endDate}
                    />
                    {workOrderRaw.functionalTimeMinutes > 0 && (
                      <div className="p-2 bg-primary/10 rounded border border-primary/20 text-center">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Tiempo Funcional
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {workOrderRaw.functionalTimeMinutes}{' '}
                          <span className="text-sm font-normal">min</span>
                        </p>
                      </div>
                    )}
                    {workOrderRaw.downtimeMinutes != null && (
                      <div className="p-2 bg-destructive/10 rounded border border-destructive/20 text-center">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                          Tiempo Muerto
                        </p>
                        <p className="text-lg font-bold text-destructive">
                          {workOrderRaw.downtimeMinutes}{' '}
                          <span className="text-sm font-normal">min</span>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {requester && (
            <Card className="bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-primary" /> Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium text-foreground">
                  {requester.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Nómina: {requester.employeeNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {requester.email}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card shadow-sm border-primary/20">
            <CardHeader className="border-b border-border/50 pb-3 ">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-5 w-5 text-primary" /> Equipo Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadTechnician ? (
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    Líder Asignado
                  </p>
                  <div className="flex items-center gap-3 bg-background border border-border p-2 rounded-lg shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {leadTechnician.firstName[0]}
                      {leadTechnician.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground leading-none">
                        {leadTechnician.fullName}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin asignar
                </p>
              )}

              {order.technicians && order.technicians.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Técnicos de Apoyo
                  </p>
                  <div className="space-y-2">
                    {order.technicians
                      .filter((t) => !t.isLead)
                      .map((t) => {
                        const auxTech = unmaskFragment(
                          UserBasicFragmentDoc,
                          t.technician,
                        );
                        return (
                          <div
                            key={auxTech.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {auxTech.firstName[0]}
                            </div>
                            <span>{auxTech.fullName}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {(isTemporaryRepair || isCompleted || signatures.length > 0) && (
          <Card className="bg-card shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-border/50 pb-3 flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pen className="h-5 w-5 text-primary" /> Conformidad y Firmas
              </CardTitle>
              {order.isFullySigned && (
                <Badge variant="default" className="bg-success">
                  Completamente Firmada
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-xl border border-border bg-muted/10 h-32 flex flex-col justify-center items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Solicitante
                  </p>
                  {signatures.find(
                    (s) => s.signer.role.name === 'REQUESTER',
                  ) ? (
                    <img
                      src={
                        signatures.find(
                          (s) => s.signer.role.name === 'REQUESTER',
                        )?.signatureImagePath
                      }
                      alt="Firma"
                      width={192}
                      height={48}
                      className="h-12 object-contain"
                    />
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="text-center p-4 rounded-xl border border-border bg-muted/10 h-32 flex flex-col justify-center items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Técnico
                  </p>
                  {signatures.find(
                    (s) => s.signer.role.name === 'TECHNICIAN',
                  ) ? (
                    <img
                      src={
                        signatures.find(
                          (s) => s.signer.role.name === 'TECHNICIAN',
                        )?.signatureImagePath
                      }
                      alt="Firma"
                      width={192}
                      height={48}
                      className="h-12 object-contain"
                    />
                  ) : (
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="text-center p-4 rounded-xl border border-border bg-primary/5 h-32 flex flex-col justify-center items-center relative">
                  <p className="text-sm font-medium text-primary mb-2">
                    Administrador (Tú)
                  </p>
                  {adminSignature ? (
                    <img
                      src={adminSignature.signatureImagePath}
                      alt="Firma admin"
                      width={192}
                      height={48}
                      className="h-12 object-contain"
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSignModalOpen(true)}
                      className="bg-background shadow-sm border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Pen className="h-3 w-3 mr-2" /> Firmar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Súper-Gestionar OT */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Gestionar Orden de Trabajo</DialogTitle>
            <DialogDescription>Define los parámetros técnicos y el equipo de trabajo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">

            {/* Bloque 1: Parámetros (Siempre editable) */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
              <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">1. Parámetros Generales</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mgmt-priority">Prioridad</Label>
                  <Select value={mgmt.priority} onValueChange={(v) => setMgmt((p) => ({ ...p, priority: v as WorkOrderPriority }))}>
                    <SelectTrigger id="mgmt-priority"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mgmt-stoppage">Tipo de Parada</Label>
                  <Select value={mgmt.stoppageType} onValueChange={(v) => setMgmt((p) => ({ ...p, stoppageType: v as StopType }))}>
                    <SelectTrigger id="mgmt-stoppage"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {STOPPAGE_TYPES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mgmt-shift">Turno</Label>
                  <Select value={mgmt.shiftId} onValueChange={(v) => setMgmt((p) => ({ ...p, shiftId: v }))}>
                    <SelectTrigger id="mgmt-shift"><SelectValue placeholder="Seleccionar Turno" /></SelectTrigger>
                    <SelectContent>
                      {shifts.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mgmt-maintenance">Tipo de Mantenimiento</Label>
                  <Select value={mgmt.maintenanceType} onValueChange={(v) => setMgmt((p) => ({ ...p, maintenanceType: v as MaintenanceType }))}>
                    <SelectTrigger id="mgmt-maintenance"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TYPES.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showMachineField && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label htmlFor="mgmt-machine" className="text-destructive font-semibold">Máquina Afectada (Requerido)*</Label>
                  <Select value={mgmt.machineId} onValueChange={(v) => setMgmt((p) => ({ ...p, machineId: v }))}>
                    <SelectTrigger id="mgmt-machine"><SelectValue placeholder="Seleccionar Máquina" /></SelectTrigger>
                    <SelectContent>
                      {availableMachines.length > 0 ? availableMachines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name} [{m.code}]</SelectItem>
                      )) : <SelectItem value="none" disabled>No hay máquinas en esta subárea</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Bloque 2: Equipo Técnico (Condicional) */}
            <div className={`space-y-4 p-4 rounded-lg border border-border ${!isPending ? 'opacity-50 pointer-events-none bg-muted' : 'bg-primary/5'}`}>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">2. Asignación de Personal</h4>
                {!isPending && <Badge variant="outline" className="text-xs">Bloqueado (Orden ya inició)</Badge>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mgmt-lead-tech">Técnico Líder *</Label>
                <Select value={mgmt.leadTechnicianId} onValueChange={(v) => setMgmt((p) => ({ ...p, leadTechnicianId: v }))}>
                  <SelectTrigger id="mgmt-lead-tech" className="bg-background"><SelectValue placeholder="Seleccionar líder" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => {
                      const tUser = unmaskFragment(UserBasicFragmentDoc, tech.user);
                      return <SelectItem key={tUser.id} value={tUser.id}>{tUser.fullName}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3" role="group" aria-labelledby="mgmt-aux-tech-label">
                <Label id="mgmt-aux-tech-label" className="text-sm">Técnicos de Apoyo (Opcional)</Label>
                {auxiliaryTechnicians.map((auxTechId, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={auxTechId}
                      onValueChange={(v) => {
                        const updated = [...auxiliaryTechnicians];
                        updated[index] = v;
                        setAuxiliaryTechnicians(updated);
                      }}
                    >
                      <SelectTrigger className="flex-1 bg-background"><SelectValue placeholder="Técnico de apoyo" /></SelectTrigger>
                      <SelectContent>
                        {technicians
                          .filter(t => unmaskFragment(UserBasicFragmentDoc, t.user)?.id !== mgmt.leadTechnicianId)
                          .map((tech) => {
                            const tUser = unmaskFragment(UserBasicFragmentDoc, tech.user);
                            return <SelectItem key={tUser.id} value={tUser.id}>{tUser.fullName}</SelectItem>;
                          })}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" aria-label="Eliminar técnico de apoyo" className="text-destructive" onClick={() => {
                      const updated = auxiliaryTechnicians.filter((_, i) => i !== index);
                      setAuxiliaryTechnicians(updated);
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setAuxiliaryTechnicians([...auxiliaryTechnicians, ''])} className="w-full border-dashed bg-transparent">
                  <UserPlus className="h-4 w-4 mr-2" /> Añadir apoyo
                </Button>
              </div>
            </div>

          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t">
            <Button variant="outline" onClick={() => setManageOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveManagement} disabled={isProcessing}>
              {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Reanudación */}
      <Dialog open={resumeConfirmOpen} onOpenChange={setResumeConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirmar Reanudación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea forzar la reanudación de esta orden? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResumeConfirmOpen(false)}>Cancelar</Button>
            <Button variant="secondary" disabled={resuming} onClick={() => { setResumeConfirmOpen(false); handleResumeFromPause(); }}>
              {resuming ? 'Reanudando...' : 'Confirmar Reanudación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Firma */}
      <SignatureDialog
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
        title="Firma del Administrador"
      />
    </div>
  );
}

function TimelineItem({ icon, label, date }: { icon: React.ReactNode; label: string; date: string | Date }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shadow-sm bg-muted">
        {icon}
      </div>
      <div className="pt-1.5">
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(date).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default AdminOrdenDetallePage;
