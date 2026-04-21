import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';

import {
  GetMaterialRequestHistoriesDocument,
  UpdateMaterialRequestHistoryDocument,
  type StatusHistoryMr,
} from '@/lib/graphql/generated/graphql';

import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDate,
} from '@/components/material-requests/material-request.constants';
import {
  getDeliveryStatusLabel,
  getDeliveryStatusColor,
} from '@/lib/material-requests/delivery-status.util';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Search, Pencil, Eye, X, ClipboardList, Loader2 } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING_PURCHASE_REQUEST: 'Pendiente S.C.',
  PENDING_QUOTATION: 'Pendiente cotización',
  PENDING_APPROVAL_QUOTATION: 'Aprobación cotización',
  PENDING_SUPPLIER_REGISTRATION: 'Alta proveedor',
  PENDING_PURCHASE_ORDER: 'Pendiente O.C.',
  PENDING_PAYMENT: 'Pendiente pago',
  PENDING_DELIVERY: 'Pendiente entrega',
  DELIVERED: 'Entregado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PURCHASE_REQUEST: 'bg-orange-100 text-orange-700 border-orange-200',
  PENDING_QUOTATION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PENDING_APPROVAL_QUOTATION: 'bg-amber-100 text-amber-700 border-amber-200',
  PENDING_SUPPLIER_REGISTRATION: 'bg-sky-100 text-sky-700 border-sky-200',
  PENDING_PURCHASE_ORDER: 'bg-blue-100 text-blue-700 border-blue-200',
  PENDING_PAYMENT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PENDING_DELIVERY: 'bg-violet-100 text-violet-700 border-violet-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
};

const SERVICE_CATEGORIES = new Set(['SERVICE', 'SERVICE_WITH_MATERIAL']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveArea(
  machines: Array<{ machine?: { area?: { name: string } | null; subArea?: { area?: { name: string } | null } | null } | null }>,
): string | undefined {
  const names = new Set<string>();
  for (const mrm of machines) {
    const name = mrm.machine?.area?.name ?? mrm.machine?.subArea?.area?.name;
    if (name) names.add(name);
  }
  if (names.size === 1) return [...names][0];
  if (names.size > 1) return 'Diversas áreas';
  return undefined;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '[&>[data-slot=progress-indicator]]:bg-green-500';
  if (pct >= 70) return '[&>[data-slot=progress-indicator]]:bg-blue-500';
  if (pct >= 40) return '[&>[data-slot=progress-indicator]]:bg-yellow-500';
  return '[&>[data-slot=progress-indicator]]:bg-red-500';
}

function getProgressValue(
  histories: Array<{ progressPercentage?: number | null }> | null | undefined,
): number {
  const h = histories?.[0];
  if (!h || h.progressPercentage == null) return 0;
  return h.progressPercentage;
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface EditFormValues {
  status: string;
  purchaseRequest?: string;
  purchaseOrder?: string;
  deliveryMerchandise?: string;
  supplier?: string;
  estimatedDeliveryDate?: string;
  deliveryDate?: string;
}

const STATUSES_REQUIRING_SC = new Set([
  'PENDING_PURCHASE_ORDER',
  'PENDING_PAYMENT',
  'PENDING_DELIVERY',
  'DELIVERED',
]);

const STATUSES_REQUIRING_OC = new Set([
  'PENDING_DELIVERY',
  'DELIVERED',
]);

const editSchema: yup.ObjectSchema<EditFormValues> = yup.object({
  status: yup.string().required('El estatus es requerido'),
  purchaseRequest: yup.string().optional().when('status', {
    is: (status: string) => STATUSES_REQUIRING_SC.has(status),
    then: (schema) => schema.required('La S.C. es requerida para este estatus'),
  }),
  purchaseOrder: yup.string().optional().when('status', {
    is: (status: string) => STATUSES_REQUIRING_OC.has(status),
    then: (schema) => schema.required('La O.C. es requerida para este estatus'),
  }),
  deliveryMerchandise: yup.string().optional().when('status', {
    is: 'DELIVERED',
    then: (schema) => schema.required('La E.M. es requerida para marcar como entregado'),
  }),
  supplier: yup.string().optional(),
  estimatedDeliveryDate: yup.string().optional(),
  deliveryDate: yup.string().optional().when('status', {
    is: 'DELIVERED',
    then: (schema) => schema.required('La fecha de entrega es requerida para marcar como entregado'),
  }),
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function MaterialRequestHistoryPage() {
  const { data, loading, refetch } = useQuery(GetMaterialRequestHistoriesDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateHistory, { loading: updating }] = useMutation(
    UpdateMaterialRequestHistoryDocument,
  );

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterArea, setFilterArea] = useState('all');

  // Modals
  const [editingMrId, setEditingMrId] = useState<string | null>(null);
  const [viewingItemsMrId, setViewingItemsMrId] = useState<string | null>(null);

  const requests = useMemo(() => data?.materialRequestsWithDeleted ?? [], [data?.materialRequestsWithDeleted]);

  // Derive unique areas for filter
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    for (const r of requests) {
      const area = deriveArea(r.machines ?? []);
      if (area && area !== 'Diversas áreas') set.add(area);
    }
    return [...set].sort();
  }, [requests]);

  // Filter logic
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.folio.toLowerCase().includes(search.toLowerCase()) ||
        r.requester.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (r.machines ?? []).some((mrm) =>
          (mrm.machine?.name ?? mrm.customMachineName ?? '')
            .toLowerCase()
            .includes(search.toLowerCase()),
        );
      const h = r.histories?.[0];
      const matchStatus = filterStatus === 'all' || h?.status === filterStatus;
      const matchCategory = filterCategory === 'all' || r.category === filterCategory;
      const area = deriveArea(r.machines ?? []);
      const matchArea = filterArea === 'all' || area === filterArea;
      return matchSearch && matchStatus && matchCategory && matchArea;
    });
  }, [requests, search, filterStatus, filterCategory, filterArea]);

  const hasFilters =
    search || filterStatus !== 'all' || filterCategory !== 'all' || filterArea !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterArea('all');
  };

  // Edit form
  const editingMr = requests.find((r) => r.id === editingMrId);
  const editingHistory = editingMr?.histories?.[0];

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: yupResolver(editSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedStatus = watch('status');

  const openEditModal = (mrId: string) => {
    const mr = requests.find((r) => r.id === mrId);
    const h = mr?.histories?.[0];
    reset({
      status: h?.status ?? 'PENDING_PURCHASE_REQUEST',
      purchaseRequest: h?.purchaseRequest ?? '',
      purchaseOrder: h?.purchaseOrder ?? '',
      deliveryMerchandise: h?.deliveryMerchandise ?? '',
      supplier: h?.supplier ?? '',
      estimatedDeliveryDate: h?.estimatedDeliveryDate
        ? String(h.estimatedDeliveryDate).split('T')[0]
        : '',
      deliveryDate: h?.deliveryDate ? String(h.deliveryDate).split('T')[0] : '',
    });
    setEditingMrId(mrId);
  };

  const onSubmitEdit = async (values: EditFormValues) => {
    if (!editingMrId) return;
    try {
      await updateHistory({
        variables: {
          input: {
            materialRequestId: editingMrId,
            status: values.status as StatusHistoryMr,
            purchaseRequest: values.purchaseRequest || undefined,
            purchaseOrder: values.purchaseOrder || undefined,
            deliveryMerchandise: values.deliveryMerchandise || undefined,
            supplier: values.supplier || undefined,
            estimatedDeliveryDate: values.estimatedDeliveryDate || undefined,
            deliveryDate: values.deliveryDate || undefined,
          },
        },
      });
      toast.success('Seguimiento actualizado correctamente');
      setEditingMrId(null);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el seguimiento');
    }
  };

  // Articles modal
  const viewingMr = requests.find((r) => r.id === viewingItemsMrId);

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seguimiento de Solicitudes</h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? 'Cargando...'
            : `${filtered.length} solicitud${filtered.length !== 1 ? 'es' : ''}${hasFilters ? ' encontrada' + (filtered.length !== 1 ? 's' : '') : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por folio, solicitante o máquina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 min-w-[140px] h-8 text-xs">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estatus</SelectItem>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="flex-1 min-w-[150px] h-8 text-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([val, label]: [string, string]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="flex-1 min-w-[130px] h-8 text-xs">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {uniqueAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading && requests.length === 0 ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Sin solicitudes</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? 'No hay solicitudes que coincidan con los filtros.'
                : 'No hay solicitudes de material registradas.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Folio</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Prioridad</TableHead>
                    <TableHead className="whitespace-nowrap">Estatus</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">S.C.</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">O.C.</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">E.M.</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Área</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">Equipo(s)</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Art.</TableHead>
                    <TableHead className="hidden xl:table-cell whitespace-nowrap">Justificación</TableHead>
                    <TableHead className="hidden xl:table-cell whitespace-nowrap">F. Entrega</TableHead>
                    <TableHead className="hidden xl:table-cell whitespace-nowrap">F. Est. Entrega</TableHead>
                    <TableHead className="hidden xl:table-cell whitespace-nowrap">Estado entrega</TableHead>
                    <TableHead className="hidden xl:table-cell whitespace-nowrap">Proveedor</TableHead>
                    <TableHead className="hidden sm:table-cell whitespace-nowrap">Solicitante</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">Progreso</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((req) => {
                    const h = req.histories?.[0];
                    const area = deriveArea(req.machines ?? []);
                    const machineNames = (req.machines ?? []).map(
                      (m) => m.machine?.name ?? m.customMachineName ?? '—',
                    );
                    const progress = getProgressValue(req.histories);

                    return (
                      <TableRow key={req.id} className={!req.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {req.folio}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span
                            className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_COLORS[req.priority] ?? ''}`}
                          >
                            {PRIORITY_LABELS[req.priority] ?? req.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          {h ? (
                            <span
                              className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[h.status] ?? ''}`}
                            >
                              {STATUS_LABELS[h.status] ?? h.status}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {h?.purchaseRequest || '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {h?.purchaseOrder || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          {h?.deliveryMerchandise || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          {area ?? '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs max-w-[120px] truncate">
                          {machineNames.length > 0
                            ? machineNames.length === 1
                              ? machineNames[0]
                              : `${machineNames[0]} (+${machineNames.length - 1})`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setViewingItemsMrId(req.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs max-w-[150px] truncate">
                          {req.justification || '—'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">
                          {h?.deliveryDate ? formatDate(h.deliveryDate) : '—'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">
                          {h?.estimatedDeliveryDate
                            ? formatDate(h.estimatedDeliveryDate)
                            : '—'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs whitespace-nowrap">
                          {(() => {
                            const label = getDeliveryStatusLabel(
                              h?.estimatedDeliveryDate
                                ? String(h.estimatedDeliveryDate)
                                : null,
                              h?.deliveryDate ? String(h.deliveryDate) : null,
                            );
                            if (!label) return '—';
                            const color = getDeliveryStatusColor(
                              h?.estimatedDeliveryDate
                                ? String(h.estimatedDeliveryDate)
                                : null,
                              h?.deliveryDate ? String(h.deliveryDate) : null,
                            );
                            return (
                              <span className={`font-medium ${color}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs max-w-[100px] truncate">
                          {h?.supplier || '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {req.requester.fullName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress
                              value={progress}
                              className={`h-2 flex-1 ${getProgressColor(progress)}`}
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditModal(req.id)}
                            title="Editar seguimiento"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────────────────────── */}
      <Dialog open={!!editingMrId} onOpenChange={(open) => !open && setEditingMrId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Seguimiento</DialogTitle>
            <DialogDescription>
              {editingMr?.folio} — Actualiza el estado y datos de seguimiento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Estatus *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estatus" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Solicitud de compra{STATUSES_REQUIRING_SC.has(watchedStatus) && ' *'}
                </Label>
                <Input {...register('purchaseRequest')} placeholder="S.C." />
                {errors.purchaseRequest && (
                  <p className="text-xs text-destructive">{errors.purchaseRequest.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Orden de compra{STATUSES_REQUIRING_OC.has(watchedStatus) && ' *'}
                </Label>
                <Input {...register('purchaseOrder')} placeholder="O.C." />
                {errors.purchaseOrder && (
                  <p className="text-xs text-destructive">{errors.purchaseOrder.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Entrega de mercancía{watchedStatus === 'DELIVERED' && ' *'}
                </Label>
                <Input {...register('deliveryMerchandise')} placeholder="E.M." />
                {errors.deliveryMerchandise && (
                  <p className="text-xs text-destructive">{errors.deliveryMerchandise.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input {...register('supplier')} placeholder="Proveedor" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha estimada de entrega</Label>
              <Input type="date" {...register('estimatedDeliveryDate')} />
            </div>

            {watchedStatus === 'DELIVERED' && (
              <div className="space-y-2">
                <Label>
                  Fecha de entrega *
                </Label>
                {editingHistory?.deliveryDate ? (
                  <div className="text-sm text-muted-foreground py-2">
                    {formatDate(editingHistory.deliveryDate)}
                  </div>
                ) : (
                  <>
                    <Input type="date" {...register('deliveryDate')} />
                    {errors.deliveryDate && (
                      <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>
                    )}
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMrId(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Articles Modal ───────────────────────────────────────────────────── */}
      <Dialog
        open={!!viewingItemsMrId}
        onOpenChange={(open) => !open && setViewingItemsMrId(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Artículos</DialogTitle>
            <DialogDescription>
              {viewingMr?.folio} — {CATEGORY_LABELS[viewingMr?.category ?? ''] ?? viewingMr?.category}
            </DialogDescription>
          </DialogHeader>

          {viewingMr && SERVICE_CATEGORIES.has(viewingMr.category) ? (
            <div className="py-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Descripción del servicio
              </p>
              <p className="text-sm">
                {viewingMr.description || 'Sin descripción'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">SKU</TableHead>
                    <TableHead className="text-xs">Descripción</TableHead>
                    <TableHead className="text-xs text-right">Cantidad</TableHead>
                    <TableHead className="text-xs">Unidad</TableHead>
                    <TableHead className="text-xs text-center">Genérico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(viewingMr?.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                        Sin artículos
                      </TableCell>
                    </TableRow>
                  ) : (
                    (viewingMr?.items ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-mono">
                          {item.sku || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.description || item.customName || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {item.requestedQuantity ?? '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.unitOfMeasure || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {item.isGenericAllowed ? 'Sí' : 'No'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
