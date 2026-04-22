import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';

import {
  GetTechniciansDocument,
  GetShiftsDocument,
  GetMachinesPageDataDocument,
  type MaintenanceType,
  type WorkOrderPriority,
  type StopType,
  type WorkOrderSignature,
  type WorkOrderPhoto,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  TechnicianBasicFragmentDoc,
  UserBasicFragmentDoc,
  RoleBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';
import {
  GET_WORK_ORDER_BY_ID_QUERY,
  UPDATE_WORK_ORDER_MUTATION,
  SIGN_WORK_ORDER_MUTATION,
  RESUME_WORK_ORDER_MUTATION,
  ASSIGN_WORK_ORDER_MUTATION,
  EXPORT_WORK_ORDER_PDF_MUTATION,
  CANCEL_WORK_ORDER_MUTATION,
  RESPOND_CONFORMITY_MUTATION,
} from '@/lib/graphql/operations/work-orders';

import { GET_TECH_IDS_FOR_SHIFT_QUERY } from '@/lib/graphql/operations/scheduling';
import { downloadPdfFromBase64 } from '@/lib/utils/pdf-download';
import { resolveBackendAssetUrl, uploadFileToBackend, dataUrlToFile } from '@/lib/utils/uploads';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge, StopTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderDetailSkeleton } from '@/components/ui/skeleton-loaders';
import { SignatureDialog } from '@/components/ui/signature-dialog';
import { ConformityDialog, type ConformityFormValues } from '@/components/ui/conformity-dialog';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Wrench,
  FileText,
  AlertTriangle,
  Settings,
  Play,
  Pen,
  CheckCircle,
  FileDown,
  XCircle,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

import { ManageWorkOrderDialog } from './modals/ManageWorkOrderDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

function formatMinutesToHm(totalMinutes: number): string {
  const safeMinutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.floor(totalMinutes)) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes} min`;
}


/** Grupos de turnos compatibles. Nombres en UPPERCASE para comparación consistente. */
const SHIFT_GROUPS: string[][] = [['TURNO 1', 'AVANZADA']];

function getCompatibleShiftIds(
  selectedShiftId: string,
  shifts: Array<{ id: string; name: string }>,
): string[] {
  const selected = shifts.find((s) => s.id === selectedShiftId);
  if (!selected) return [];
  const upper = selected.name.toUpperCase();
  const group = SHIFT_GROUPS.find((g) => g.includes(upper));
  if (group) {
    return shifts.filter((s) => group.includes(s.name.toUpperCase())).map((s) => s.id);
  }
  return [selectedShiftId];
}

function AdminOrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const apolloClient = useApolloClient();
  const [manageOpen, setManageOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isConformityOpen, setIsConformityOpen] = useState(false);
  const [conformityLoading, setConformityLoading] = useState(false);
  const [resumeConfirmOpen, setResumeConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [auxiliaryTechnicians, setAuxiliaryTechnicians] = useState<string[]>([]);
  const [filteredTechIds, setFilteredTechIds] = useState<Set<string> | null>(null);

  const [mgmt, setMgmt] = useState({
    priority: undefined as WorkOrderPriority | undefined,
    stoppageType: undefined as StopType | undefined,
    shiftId: '',
    maintenanceType: undefined as MaintenanceType | undefined,
    scheduledDate: '',
    workType: undefined as WorkTypeValue | undefined,
    machineId: '',
    leadTechnicianId: '',
  })

  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDER_BY_ID_QUERY, { variables: { id: id! }, skip: !id });
  const { data: techData } = useQuery(GetTechniciansDocument);
  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const [getMachines, { data: machinesData }] = useLazyQuery(GetMachinesPageDataDocument);

  const [updateOrder, { loading: updating }] = useMutation(UPDATE_WORK_ORDER_MUTATION);
  const [assignOrder, { loading: assigning }] = useMutation(ASSIGN_WORK_ORDER_MUTATION);
  const [resumeOrder, { loading: resuming }] = useMutation(RESUME_WORK_ORDER_MUTATION);
  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_WORK_ORDER_MUTATION);
  const [signWorkOrder] = useMutation(SIGN_WORK_ORDER_MUTATION);
  const [respondConformity] = useMutation(RESPOND_CONFORMITY_MUTATION);
  const [exportPdf, { loading: exportingPdf }] = useMutation<{ exportWorkOrderPdf: string }>(
    EXPORT_WORK_ORDER_PDF_MUTATION,
    {
      onCompleted: (data) => {
        downloadPdfFromBase64(data.exportWorkOrderPdf, `OT-${order?.folio ?? 'OT'}.pdf`);
        toast.success('PDF descargado correctamente');
      },
      onError: (err) => toast.error(`Error al exportar PDF: ${err.message}`),
    },
  );

  const workOrderRaw = (data as unknown as { workOrder?: Record<string, unknown> })?.workOrder;
  const order = unmaskFragment(WorkOrderItemFragmentDoc, workOrderRaw);

  const area = unmaskFragment(AreaBasicFragmentDoc, order?.area);
  const subArea = unmaskFragment(SubAreaBasicFragmentDoc, order?.subArea);
  const machine = unmaskFragment(MachineBasicFragmentDoc, order?.machine);
  const requester = unmaskFragment(UserBasicFragmentDoc, order?.requester);

  const leadTechRel = order?.technicians?.find(t => t.isLead);
  const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);

  const shifts = useMemo(() => shiftsData?.shiftsActive || [], [shiftsData?.shiftsActive]);
  const technicians = unmaskFragment(TechnicianBasicFragmentDoc, techData?.techniciansActive || []);
  const machinesRaw = machinesData?.machinesWithDeleted ?? [];

  const machinesAll = machinesRaw.map((ref) => unmaskFragment(MachineBasicFragmentDoc, ref));
  const effectiveAreaId = area?.id ?? '';

  const machinesInArea = effectiveAreaId
    ? machinesAll.filter((m) => m.areaId === effectiveAreaId || m.subArea?.area?.id === effectiveAreaId)
    : machinesAll;

  const machinesInSubArea = subArea?.id
    ? machinesAll.filter((m) => m.subAreaId === subArea.id)
    : [];


  const availableMachines = machinesInSubArea.length > 0 ? machinesInSubArea : machinesInArea;
  const areaHasMachines = machinesInArea.length > 0;

  const allTechOptions = technicians.map((tech) => {
    const tUser = unmaskFragment(UserBasicFragmentDoc, tech.user);
    return { value: tUser.id, label: tUser.fullName };
  });

  const techOptions = filteredTechIds
    ? allTechOptions.filter((o) => filteredTechIds.has(o.value))
    : allTechOptions;

  const machineOptions = availableMachines.map((m) => ({
    value: m.id, label: `${m.name} [${m.code}]`,
  }));

  const handleBack = () => navigate(-1);

  const fetchCompatibleTechIds = useCallback(
    async (shiftId: string, scheduleDate: string) => {
      const compatibleIds = getCompatibleShiftIds(shiftId, shifts);
      type ShiftScheduleResult = { technicianSchedulesFiltered: Array<{ technicianId: string }> };
      const results = await Promise.all(
        compatibleIds.map((sid) =>
          apolloClient.query<ShiftScheduleResult>({
            query: GET_TECH_IDS_FOR_SHIFT_QUERY,
            variables: { filters: { shiftId: sid, scheduleDate, onlyWorkDays: true } },
            fetchPolicy: 'network-only',
          }),
        ),
      );
      const ids = new Set<string>();
      for (const r of results) {
        for (const s of r.data?.technicianSchedulesFiltered ?? []) {
          ids.add(s.technicianId);
        }
      }
      setFilteredTechIds(ids);
    },
    [apolloClient, shifts],
  );

  useEffect(() => {
    if (!mgmt.shiftId) {
      setFilteredTechIds(null);
      return;
    }
    const date = mgmt.scheduledDate || new Date().toISOString().split('T')[0];
    fetchCompatibleTechIds(mgmt.shiftId, date);
  }, [mgmt.shiftId, mgmt.scheduledDate, fetchCompatibleTechIds]);

  useEffect(() => {
    if (manageOpen && area?.id) {
      getMachines();
    }
  }, [area?.id, manageOpen, getMachines]);

  const openManageDialog = () => {
    if (order) {
      const auxTechs = order.technicians
        ?.filter(t => !t.isLead)
        .map((t) => unmaskFragment(UserBasicFragmentDoc, t.technician)?.id || '') || [];

      setMgmt({
        priority: order.priority || undefined,
        stoppageType: order.stopType || undefined,
        shiftId: order.assignedShiftId || '',
        maintenanceType: order.maintenanceType || undefined,
        scheduledDate: (order as unknown as { scheduledDate?: string })?.scheduledDate ? new Date((order as unknown as { scheduledDate: string }).scheduledDate).toISOString().split('T')[0] : '',
        workType: (order as unknown as { workType?: WorkTypeValue })?.workType || undefined,
        machineId: order.machineId || '',
        leadTechnicianId: unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician)?.id || '',
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

        if (!mgmt.workType) {
          throw new Error("Debe seleccionar el tipo de trabajo.");
        }

        if (mgmt.maintenanceType === 'CORRECTIVE_SCHEDULED' && !mgmt.scheduledDate) {
          throw new Error("La fecha programada es obligatoria para correctivo programado.");
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
              machineId: mgmt.machineId || undefined,
              scheduledDate: mgmt.scheduledDate || undefined,
              workType: mgmt.workType
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
              scheduledDate: mgmt.scheduledDate || undefined,
              workType: mgmt.workType,
            },
          },
        });

      }

      setManageOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar la orden');
    }
  };

  const handleResumeFromPause = async () => {
    if (!order) return;
    try {
      await resumeOrder({ variables: { id: order.id } });
      refetch();
    } catch {
      toast.error('Error al resumir la orden');
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await cancelOrder({ variables: { id: order.id } });
      toast.success('Orden cancelada correctamente');
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar la orden');
    }
  }

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
      setIsSignModalOpen(false);
      toast.success('Firma guardada exitosamente');
    } catch {
      toast.error('Error guardando la firma');
    }
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
      setIsConformityOpen(false);
      if (values.isConforming) {
        toast.success('Conformidad confirmada. Ya puedes firmar la orden.');
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

  if (loading) return <WorkOrderDetailSkeleton />;

  if (error || !order || !workOrderRaw) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Orden no encontrada</h3>
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
  const isCancelled = order.status === 'CANCELLED';
  const isTemporaryRepair = order.status === 'TEMPORARY_REPAIR';
  const showMachineField = mgmt.stoppageType === 'BREAKDOWN' || !!subArea?.id;
  const showScheduledDate = mgmt.maintenanceType === 'CORRECTIVE_SCHEDULED';

  // Firmas
  const signatures: WorkOrderSignature[] = (workOrderRaw as { signatures?: WorkOrderSignature[] })?.signatures || [];
  const leadTechnicianId = leadTechnician?.id ?? null;

  // Requester signed first check
  const requesterIsAdmin = requester?.roles?.some(r => {
    const role = unmaskFragment(RoleBasicFragmentDoc, r);
    return role?.name === 'ADMIN';
  }) ?? false;

  const requesterSignature = signatures.find((s: WorkOrderSignature) => s.signer.id === requester?.id);
  const technicianSignature =
    leadTechnicianId
      ? signatures.find((s: WorkOrderSignature) => s.signer.id === leadTechnicianId)
      : undefined;
  const adminSignature = signatures.find((s: WorkOrderSignature) => {
    if (s.signer.id === requester?.id) return false;
    if (leadTechnicianId && s.signer.id === leadTechnicianId) return false;
    return s.signer.roles?.some((role: { name: string }) => role.name === 'ADMIN');
  });
  const requesterHasSigned = !!requesterSignature;

  const pendingConformity = (workOrderRaw as { pendingConformity?: boolean })?.pendingConformity ?? false;
  const conformityCycleCount = (workOrderRaw as { conformityCycleCount?: number })?.conformityCycleCount ?? 0;

  // Admin es el solicitante y debe responder conformidad primero
  const needsConformityAsRequester = (isTemporaryRepair || order.status === 'FINISHED') && requesterIsAdmin && pendingConformity;
  const canCurrentAdminSign =
    !requesterIsAdmin &&
    !!user?.roles?.some((role: { name?: string }) => role.name === 'ADMIN') &&
    !adminSignature &&
    requesterHasSigned &&
    !!technicianSignature;
  const needsMySignature = (isTemporaryRepair || order.status === 'FINISHED') && !pendingConformity && canCurrentAdminSign;

  // Fotos
  const photoBefore = (workOrderRaw as { photos?: WorkOrderPhoto[] })?.photos?.find((p: WorkOrderPhoto) => p.photoType === 'BEFORE');
  const photoAfter = (workOrderRaw as { photos?: WorkOrderPhoto[] })?.photos?.find((p: WorkOrderPhoto) => p.photoType === 'AFTER');
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
        {!isCompleted && !isCancelled && (
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
        {!isCompleted && !isCancelled && (
          <Button onClick={() => setCancelConfirmOpen(true)} disabled={cancelling} variant="destructive" className="gap-2">
            <XCircle className="h-4 w-4" />
            {cancelling ? 'Cancelando...' : 'Cancelar Orden'}
          </Button>
        )}
        {needsConformityAsRequester && (
          <Button onClick={() => setIsConformityOpen(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
            <ClipboardList className="h-4 w-4" />
            Responder Conformidad
          </Button>
        )}
        {needsMySignature && (
          <Button onClick={() => setIsSignModalOpen(true)} className="gap-2 bg-success hover:bg-success/90 text-success-foreground shadow-sm">
            <Pen className="h-4 w-4" />
            Firmar como Administrador
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportPdf({ variables: { id: order.id } })}
          disabled={!order.isFullySigned || exportingPdf}
          title={!order.isFullySigned ? `Requiere ${requesterIsAdmin ? 2 : 3} firmas para exportar` : 'Exportar PDF'}
          className="gap-2 ml-auto"
        >
          <FileDown className="h-4 w-4" />
          {exportingPdf ? 'Exportando...' : 'Exportar PDF'}
        </Button>
      </div>

      {/* Banner de Cancelada */}
      {isCancelled && (
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-slate-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-700 uppercase tracking-tight">Orden Cancelada</p>
                <p className="text-sm text-slate-600/80 mt-0.5">Esta orden de trabajo ha sido anulada por un administrador.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banner de Pausa */}
      {order.status === 'PAUSED' && (workOrderRaw as { pauseReason?: string })?.pauseReason && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700">Orden en pausa</p>
                <p className="text-sm text-amber-600/80 mt-1">Razón: {(workOrderRaw as { pauseReason?: string }).pauseReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Columna principal (izquierda) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className={cn("bg-card shadow-sm transition-opacity", isCancelled && "opacity-60")}>
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
                    src={resolveBackendAssetUrl(photoBefore.filePath)}
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

          <Card className={cn("bg-card shadow-sm transition-opacity", isCancelled && "opacity-60")}>
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
                  <span className="text-muted-foreground">Equipo/Estructura</span>
                  <span className="font-medium">
                    {machine ? `${machine.name} [${machine.code}]` : '--'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporte de cierre técnico */}
          {(workOrderRaw as { endDate?: string })?.endDate && (
            <Card className="bg-card shadow-sm border-primary/20">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-5 w-5 text-primary" /> Reporte de Cierre
                  Técnico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {(order.stopType === 'BREAKDOWN' || order.stopType === 'OTHER') && (() => {
                  const raw = workOrderRaw as { cause?: string; actionTaken?: string; toolsUsed?: string };
                  const hasBreakdownContent = raw.cause || raw.actionTaken || raw.toolsUsed;
                  const showBox = order.stopType === 'BREAKDOWN' || (order.stopType === 'OTHER' && hasBreakdownContent);
                  if (!showBox) return null;
                  return (
                    <div className="grid md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
                      {raw.cause && (
                        <div>
                          <p className="text-muted-foreground font-medium mb-1">
                            Causa Raíz
                          </p>
                          <p>{raw.cause}</p>
                        </div>
                      )}
                      {raw.actionTaken && (
                        <div>
                          <p className="text-muted-foreground font-medium mb-1">
                            Acción Realizada
                          </p>
                          <p>{raw.actionTaken}</p>
                        </div>
                      )}
                      {raw.toolsUsed && (
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground font-medium mb-1">
                            Herramientas / Materiales
                          </p>
                          <p>{raw.toolsUsed}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {(workOrderRaw as { observations?: string })?.observations && (
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">
                      Observaciones Generales
                    </p>
                    <p className="bg-muted p-3 rounded-md">
                      {(workOrderRaw as { observations?: string }).observations}
                    </p>
                  </div>
                )}
                {photoAfter && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Evidencia Final (Después)
                    </p>
                    <img
                      src={resolveBackendAssetUrl(photoAfter.filePath)}
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
          <Card className={cn("bg-card shadow-sm transition-opacity", isCancelled && "opacity-60")}>
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
                {(workOrderRaw as { startDate?: string })?.startDate && (
                  <TimelineItem
                    icon={<Play className="text-chart-3" />}
                    label="Iniciada"
                    date={(workOrderRaw as { startDate: string }).startDate}
                  />
                )}
                {(workOrderRaw as { endDate?: string })?.endDate && (
                  <>
                    <TimelineItem
                      icon={<CheckCircle className="text-success" />}
                      label="Finalizada"
                      date={(workOrderRaw as { endDate: string }).endDate}
                    />
                    {(workOrderRaw as { functionalTimeMinutes?: number })?.functionalTimeMinutes ? (
                      <div className="p-2 bg-primary/10 rounded border border-primary/20 text-center">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Tiempo Funcional
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatMinutesToHm((workOrderRaw as { functionalTimeMinutes: number }).functionalTimeMinutes)}
                        </p>
                      </div>
                    ) : null}
                    {(workOrderRaw as { downtimeMinutes?: number })?.downtimeMinutes != null && (
                      <div className="p-2 bg-destructive/10 rounded border border-destructive/20 text-center">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                          Tiempo Muerto
                        </p>
                        <p className="text-lg font-bold text-destructive">
                          {(workOrderRaw as { downtimeMinutes: number }).downtimeMinutes}{' '}
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
            <Card className={cn("bg-card shadow-sm transition-opacity", isCancelled && "opacity-60")}>
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

          <Card className={cn("bg-card shadow-sm border-primary/20 transition-opacity", isCancelled && "opacity-60")}>
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
              {requesterIsAdmin && pendingConformity && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  Pendiente de evaluación de conformidad. Usa el botón "Responder Conformidad" para continuar.
                </p>
              )}
              <div className={`grid gap-4 ${requesterIsAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {!requesterIsAdmin && (
                <div className="text-center p-4 rounded-xl border border-border bg-muted/10 h-32 flex flex-col justify-center items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Solicitante
                  </p>
                  {requesterSignature ? (
                    <img
                      src={resolveBackendAssetUrl(
                        requesterSignature.signatureImagePath
                      )}
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
                )}
                <div className="text-center p-4 rounded-xl border border-border bg-muted/10 h-32 flex flex-col justify-center items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Técnico
                  </p>
                  {technicianSignature ? (
                    <img
                      src={resolveBackendAssetUrl(
                        technicianSignature.signatureImagePath
                      )}
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
                    {requesterIsAdmin ? 'Solicitante / Administrador (Tú)' : 'Administrador (Tú)'}
                  </p>
                  {(requesterIsAdmin ? requesterSignature : adminSignature) ? (
                    <img
                      src={resolveBackendAssetUrl(
                        (requesterIsAdmin ? requesterSignature?.signatureImagePath : adminSignature?.signatureImagePath) || ''
                      )}
                      alt="Firma admin"
                      width={192}
                      height={48}
                      className="h-12 object-contain"
                    />
                  ) : pendingConformity && requesterIsAdmin ? (
                    <span className="text-xs text-center px-2 py-1 rounded text-amber-600 bg-amber-50 border border-amber-200">
                      Responder conformidad primero
                    </span>
                  ) : canCurrentAdminSign ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSignModalOpen(true)}
                      className="bg-background shadow-sm border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Pen className="h-3 w-3 mr-2" /> Firmar
                    </Button>
                  ) : (
                    <span className="text-xs text-center px-2 py-1 rounded text-amber-600 bg-amber-50 border border-amber-200">
                      {requesterHasSigned ? 'Esperando firma del técnico' : 'Esperando firma del solicitante'}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Súper-Gestionar OT */}
      <ManageWorkOrderDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        showMachineField={showMachineField}
        showScheduledDate={showScheduledDate}
        isPending={isPending}
        isProcessing={isProcessing}
        mgmt={mgmt}
        setMgmt={(updater) => {
          setMgmt((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (next.shiftId !== prev.shiftId) {
              setAuxiliaryTechnicians([]);
              return { ...next, leadTechnicianId: '' };
            }
            return next;
          });
        }}
        auxiliaryTechnicians={auxiliaryTechnicians}
        setAuxiliaryTechnicians={setAuxiliaryTechnicians}
        machineOptions={machineOptions}
        techOptions={techOptions}
        shifts={shifts}
        priorities={PRIORITIES}
        stoppageTypes={STOPPAGE_TYPES}
        maintenanceTypes={MAINTENANCE_TYPES}
        workTypes={WORK_TYPES}
        disableBreakdown={!areaHasMachines}
        breakdownDisabledHint="sin equipos en el área"
        onSave={handleSaveManagement}
      />

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

      {/* Modal Confirmar Cancelación */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cancelar esta orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la orden como CANCELADA. No se podrá revertir y quedará anulada para el técnico y solicitante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, Cancelar Orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Firma */}
      <SignatureDialog
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
        title={requesterIsAdmin ? 'Firma del Solicitante / Administrador' : 'Firma del Administrador'}
      />

      {/* Modal Conformidad — cuando el admin es el solicitante */}
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
