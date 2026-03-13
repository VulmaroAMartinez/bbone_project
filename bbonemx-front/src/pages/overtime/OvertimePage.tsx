import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import {
  GET_OVERTIME_RECORDS_QUERY,
  GET_MY_OVERTIME_RECORDS_QUERY,
  CREATE_OVERTIME_MUTATION,
  UPDATE_OVERTIME_MUTATION,
  DELETE_OVERTIME_MUTATION,
  GET_ACTIVE_TECHNICIANS_QUERY,
  GET_POSITIONS_QUERY,
} from '@/lib/graphql/operations/overtime';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  Clock,
  Filter,
  X,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface OvertimeRecord {
  id: string;
  workDate: string;
  startTime: string;
  endTime: string;
  workTime: string;
  activity: string;
  reasonForPayment: string | null;
  technicianId: string;
  technician: {
    id: string;
    user: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
    };
    position: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

interface TechnicianOption {
  id: string;
  user: {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
  };
  position: {
    id: string;
    name: string;
  };
}

interface PositionOption {
  id: string;
  name: string;
  isActive: boolean;
}

// ── Enums / Labels ─────────────────────────────────────
const REASON_FOR_PAYMENT_OPTIONS = [
  { value: 'HOLIDAY', label: 'Día festivo' },
  { value: 'WORK_BREAK', label: 'Descanso laboral' },
  { value: 'OVERTIME', label: 'Tiempo extra' },
];

const getReasonLabel = (reason: string | null) => {
  if (!reason) return '—';
  return REASON_FOR_PAYMENT_OPTIONS.find((o) => o.value === reason)?.label ?? reason;
};

const getReasonBadgeVariant = (reason: string | null): 'default' | 'secondary' | 'outline' => {
  if (!reason) return 'outline';
  switch (reason) {
    case 'HOLIDAY': return 'default';
    case 'WORK_BREAK': return 'secondary';
    case 'OVERTIME': return 'default';
    default: return 'outline';
  }
};

// ── Schemas ────────────────────────────────────────────
const createOvertimeSchema = yup.object({
  workDate: yup.string().required('La fecha es obligatoria'),
  startTime: yup.string().required('La hora de inicio es obligatoria').matches(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime: yup.string().required('La hora de fin es obligatoria').matches(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  activity: yup.string().required('La actividad es obligatoria').trim(),
  reasonForPayment: yup.string().nullable().optional(),
  technicianId: yup.string().nullable().optional(),
});

type OvertimeFormValues = yup.InferType<typeof createOvertimeSchema>;

const EMPTY_FORM: OvertimeFormValues = {
  workDate: '',
  startTime: '',
  endTime: '',
  activity: '',
  reasonForPayment: null,
  technicianId: null,
};

// ── Helper ─────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ── Page ───────────────────────────────────────────────
export default function OvertimePage() {
  const { isAdmin } = useAuth();

  // ── State ──
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<OvertimeRecord | null>(null);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPositionId, setFilterPositionId] = useState('');
  const [filterReason, setFilterReason] = useState('');

  // ── Queries ──
  const query = isAdmin ? GET_OVERTIME_RECORDS_QUERY : GET_MY_OVERTIME_RECORDS_QUERY;
  const queryVars = isAdmin
    ? {
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
        positionId: filterPositionId || undefined,
        reasonForPayment: filterReason || undefined,
      }
    : {};

  const { data, loading, refetch } = useQuery(query, {
    variables: queryVars,
    fetchPolicy: 'cache-and-network',
  });

  const records: OvertimeRecord[] = isAdmin
    ? (data as { overtimeRecords: OvertimeRecord[] })?.overtimeRecords ?? []
    : (data as { myOvertimeRecords: OvertimeRecord[] })?.myOvertimeRecords ?? [];

  const { data: techData } = useQuery(GET_ACTIVE_TECHNICIANS_QUERY, { skip: !isAdmin });
  const technicians: TechnicianOption[] = (techData as { techniciansActive: TechnicianOption[] })?.techniciansActive ?? [];

  const { data: posData } = useQuery(GET_POSITIONS_QUERY, { skip: !isAdmin });
  const positions: PositionOption[] = ((posData as { positions: PositionOption[] })?.positions ?? []).filter((p: PositionOption) => p.isActive);

  // ── Mutations ──
  const [createOvertime, { loading: creating }] = useMutation(CREATE_OVERTIME_MUTATION);
  const [updateOvertime, { loading: updating }] = useMutation(UPDATE_OVERTIME_MUTATION);
  const [deleteOvertime] = useMutation(DELETE_OVERTIME_MUTATION);

  // ── Create Form ──
  const createForm = useForm<OvertimeFormValues>({
    resolver: yupResolver<OvertimeFormValues, any, any>(createOvertimeSchema),
    defaultValues: EMPTY_FORM,
  });

  // ── Edit Form ──
  const editForm = useForm<OvertimeFormValues>({
    resolver: yupResolver<OvertimeFormValues, any, any>(createOvertimeSchema),
    defaultValues: EMPTY_FORM,
  });

  // ── Handlers ──
  const handleCreate = async (values: OvertimeFormValues) => {
    try {
      const input: Record<string, unknown> = {
        workDate: values.workDate,
        startTime: values.startTime,
        endTime: values.endTime,
        activity: values.activity,
      };
      if (isAdmin && values.technicianId) input.technicianId = values.technicianId;
      if (isAdmin && values.reasonForPayment) input.reasonForPayment = values.reasonForPayment;

      await createOvertime({ variables: { input } });
      toast.success('Registro de horas extra creado');
      setCreateOpen(false);
      createForm.reset(EMPTY_FORM);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al crear registro');
    }
  };

  const handleEdit = async (values: OvertimeFormValues) => {
    if (!selected) return;
    try {
      const input: Record<string, unknown> = {
        id: selected.id,
        workDate: values.workDate,
        startTime: values.startTime,
        endTime: values.endTime,
        activity: values.activity,
      };
      if (isAdmin && values.reasonForPayment) input.reasonForPayment = values.reasonForPayment;

      await updateOvertime({ variables: { input } });
      toast.success('Registro actualizado');
      setEditOpen(false);
      setSelected(null);
      editForm.reset(EMPTY_FORM);
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al actualizar registro');
    }
  };

  const handleDelete = async (record: OvertimeRecord) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await deleteOvertime({ variables: { id: record.id } });
      toast.success('Registro eliminado');
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al eliminar registro');
    }
  };

  const openEdit = (record: OvertimeRecord) => {
    setSelected(record);
    editForm.reset({
      workDate: record.workDate.split('T')[0],
      startTime: record.startTime.substring(0, 5),
      endTime: record.endTime.substring(0, 5),
      activity: record.activity,
      reasonForPayment: record.reasonForPayment ?? null,
      technicianId: record.technicianId,
    });
    setEditOpen(true);
  };

  const openView = (record: OvertimeRecord) => {
    setSelected(record);
    setViewOpen(true);
  };

  const canEdit = (record: OvertimeRecord) => {
    if (isAdmin) return true;
    return !record.reasonForPayment;
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterPositionId('');
    setFilterReason('');
  };

  const hasFilters = filterStartDate || filterEndDate || filterPositionId || filterReason;

  // ── Render ───────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horas Extra</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestión de horas extra de todos los técnicos' : 'Mis registros de horas extra'}
          </p>
        </div>
        <Button onClick={() => { createForm.reset(EMPTY_FORM); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            {isAdmin && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Puesto</Label>
                  <Select value={filterPositionId} onValueChange={setFilterPositionId}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Razón de pago</Label>
                  <Select value={filterReason} onValueChange={setFilterReason}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_FOR_PAYMENT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" /> Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <>
                      <TableHead>No. Empleado</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Puesto</TableHead>
                    </>
                  )}
                  <TableHead>Fecha</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Razón de pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && (
                        <>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </>
                      )}
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 9 : 6} className="text-center py-8 text-muted-foreground">
                      <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      No hay registros de horas extra
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      {isAdmin && (
                        <>
                          <TableCell className="font-mono text-sm">
                            {record.technician.user.employeeNumber}
                          </TableCell>
                          <TableCell>
                            {record.technician.user.firstName} {record.technician.user.lastName}
                          </TableCell>
                          <TableCell>{record.technician.position?.name}</TableCell>
                        </>
                      )}
                      <TableCell>{formatDate(record.workDate)}</TableCell>
                      <TableCell>{record.startTime.substring(0, 5)}</TableCell>
                      <TableCell>{record.endTime.substring(0, 5)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {record.workTime}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getReasonBadgeVariant(record.reasonForPayment)}>
                          {getReasonLabel(record.reasonForPayment)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openView(record)} title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit(record) && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(record)} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canEdit(record) && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(record)} title="Eliminar" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Create Modal ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Horas Extra</DialogTitle>
            <DialogDescription>Ingresa los datos del registro de tiempo extra</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            {isAdmin && (
              <div className="space-y-1.5">
                <Label>Técnico *</Label>
                <Controller
                  name="technicianId"
                  control={createForm.control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.user.employeeNumber} - {t.user.firstName} {t.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" {...createForm.register('workDate')} />
              {createForm.formState.errors.workDate && (
                <p className="text-xs text-destructive">{createForm.formState.errors.workDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Hora inicio *</Label>
                <Input type="time" {...createForm.register('startTime')} />
                {createForm.formState.errors.startTime && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Hora fin *</Label>
                <Input type="time" {...createForm.register('endTime')} />
                {createForm.formState.errors.endTime && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Actividad *</Label>
              <Textarea {...createForm.register('activity')} placeholder="Describe la actividad realizada" rows={3} />
              {createForm.formState.errors.activity && (
                <p className="text-xs text-destructive">{createForm.formState.errors.activity.message}</p>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <Label>Razón de pago</Label>
                <Controller
                  name="reasonForPayment"
                  control={createForm.control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_FOR_PAYMENT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>Modifica los datos del registro de tiempo extra</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" {...editForm.register('workDate')} />
              {editForm.formState.errors.workDate && (
                <p className="text-xs text-destructive">{editForm.formState.errors.workDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Hora inicio *</Label>
                <Input type="time" {...editForm.register('startTime')} />
                {editForm.formState.errors.startTime && (
                  <p className="text-xs text-destructive">{editForm.formState.errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Hora fin *</Label>
                <Input type="time" {...editForm.register('endTime')} />
                {editForm.formState.errors.endTime && (
                  <p className="text-xs text-destructive">{editForm.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Actividad *</Label>
              <Textarea {...editForm.register('activity')} rows={3} />
              {editForm.formState.errors.activity && (
                <p className="text-xs text-destructive">{editForm.formState.errors.activity.message}</p>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <Label>Razón de pago</Label>
                <Controller
                  name="reasonForPayment"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_FOR_PAYMENT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {!isAdmin && selected?.reasonForPayment && (
              <div className="space-y-1.5">
                <Label>Razón de pago</Label>
                <div className="py-2 px-3 bg-muted rounded-md text-sm">
                  {getReasonLabel(selected.reasonForPayment)}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={updating}>
                {updating ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Modal ── */}
      <Dialog open={viewOpen} onOpenChange={(open) => { setViewOpen(open); if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Registro</DialogTitle>
            <DialogDescription>Información del registro de horas extra</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Técnico</p>
                  <p className="text-sm font-medium">
                    {selected.technician.user.firstName} {selected.technician.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. Empleado</p>
                  <p className="text-sm font-mono">{selected.technician.user.employeeNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Puesto</p>
                  <p className="text-sm">{selected.technician.position?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm">{formatDate(selected.workDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora inicio</p>
                  <p className="text-sm">{selected.startTime.substring(0, 5)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora fin</p>
                  <p className="text-sm">{selected.endTime.substring(0, 5)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Horas trabajadas</p>
                  <Badge variant="secondary" className="font-mono">{selected.workTime}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Razón de pago</p>
                  <Badge variant={getReasonBadgeVariant(selected.reasonForPayment)}>
                    {getReasonLabel(selected.reasonForPayment)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actividad</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selected.activity}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
