import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  GetActivitiesFilteredDocument,
  GetMachinesByAreaDocument,
  DeleteActivityDocument,
  UpdateActivityPriorityDocument,
  type GetActivitiesFilteredQuery,
} from '@/lib/graphql/generated/graphql';
import type { ActivitySortField, ActivityStatus, SortOrder } from '@/lib/graphql/generated/graphql';
import { gql } from '@apollo/client';
import { downloadBlob } from '@/lib/utils/excel-download';
import { getApiBaseUrl } from '@/lib/utils/uploads';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Edit2,
  MoreVertical,
  Loader2,
  Eye,
  ClipboardList,
  FileText,
  ArrowUpDown,
  Trash2,
  Download,
} from 'lucide-react';

const GET_FILTERS_DATA = gql`
  query GetFiltersDataForActivity {
    areasActive {
      id
      name
    }
    techniciansActive {
      id
      user {
        id
        fullName
      }
    }
  }
`;

type FiltersDataQuery = {
  areasActive: Array<{ id: string; name: string }>;
  techniciansActive: Array<{
    id: string;
    user: {
      id: string;
      fullName: string;
    };
  }>;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Realizado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [machineFilter, setMachineFilter] = useState<string>('');
  const [technicianFilter, setTechnicianFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<ActivitySortField>('CREATED_AT');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  type ActivityRow = {
    id: string;
    activity: string;
    startDate?: string | null;
    endDate?: string | null;
    status: string;
    progress: number;
    comments?: string | null;
    priority: boolean;
    area?: { name: string } | null;
    machine?: { name: string } | null;
    technicians?: Array<{
      technician?: {
        fullName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    }> | null;
  };
  const [viewActivity, setViewActivity] = useState<ActivityRow | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data: filtersData } = useQuery<FiltersDataQuery>(GET_FILTERS_DATA);
  const { data: machinesData } = useQuery<{ machinesByArea: Array<{ id: string; name: string }> }>(
    GetMachinesByAreaDocument,
    {
      variables: { areaId: areaFilter || undefined },
      skip: !areaFilter,
    },
  );

  const { data, loading, refetch } = useOfflineAwareQuery<GetActivitiesFilteredQuery>(GetActivitiesFilteredDocument, {
    variables: {
      filters: {
        areaId: areaFilter || undefined,
        machineId: machineFilter || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter || undefined,
        search: searchTerm || undefined,
      },
      pagination: { page, limit },
      sort: { field: sortField, order: sortOrder },
    },
  });

  const [updatePriority] = useMutation(UpdateActivityPriorityDocument);
  const [deleteActivity] = useMutation(DeleteActivityDocument);

  const baseName = `actividades-${new Date().toISOString().split('T')[0]}`;
  const excelFilename = `${baseName}.xlsx`;
  const pdfFilename = `${baseName}.pdf`;

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/activities/export/excel`,
        {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            areaId: areaFilter || undefined,
            machineId: machineFilter || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            priority: priorityFilter || undefined,
            search: searchTerm || undefined,
          },
          sort: { field: sortField, order: sortOrder },
          filename: excelFilename,
        }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      downloadBlob(blob, excelFilename);
      toast.success('Excel descargado correctamente');
    } catch (err) {
      toast.error(
        `Error al exportar: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/activities/export/pdf`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filters: {
              areaId: areaFilter || undefined,
              machineId: machineFilter || undefined,
              technicianId: technicianFilter || undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              priority: priorityFilter || undefined,
              search: searchTerm || undefined,
            },
            sort: { field: sortField, order: sortOrder },
            filename: pdfFilename,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      downloadBlob(blob, pdfFilename);
      toast.success('PDF descargado correctamente');
    } catch (err) {
      toast.error(
        `Error al exportar: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setExporting(false);
    }
  };

  const activities = (data?.activitiesFiltered?.data || []) as unknown as ActivityRow[];
  const total = data?.activitiesFiltered?.total || 0;
  const totalPages = data?.activitiesFiltered?.totalPages || 1;

  const areaOptions = useMemo(
    () => (filtersData?.areasActive || []).map((a: { id: string; name: string }) => ({ value: a.id, label: a.name })),
    [filtersData],
  );

  const technicianOptions = useMemo(
    () => (filtersData?.techniciansActive || []).map((t: { id: string; user: { fullName: string } }) => ({ value: t.id, label: t.user.fullName })),
    [filtersData],
  );

  const machineOptions = useMemo(
    () => (machinesData?.machinesByArea || []).map((m) => ({ value: m.id, label: m.name })),
    [machinesData],
  );

  const handlePriorityToggle = async (activityId: string, current: boolean) => {
    try {
      await updatePriority({ variables: { id: activityId, priority: !current } });
      refetch();
    } catch {
      toast.error('Error al actualizar prioridad');
    }
  };

  const handleDelete = (activityId: string) => {
    setDeletingActivityId(activityId);
  };

  const confirmDelete = async () => {
    if (!deletingActivityId) return;
    try {
      await deleteActivity({ variables: { id: deletingActivityId } });
      toast.success('Actividad eliminada');
      refetch();
    } catch {
      toast.error('Error al eliminar actividad');
    } finally {
      setDeletingActivityId(null);
    }
  };

  const toggleSort = (field: ActivitySortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
  };

  const handleAreaChange = (val: string) => {
    setAreaFilter(val);
    setMachineFilter('');
    setPage(1);
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exporting}>
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf}>
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate('/admin/actividades/nueva')}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar actividad..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Combobox
              options={areaOptions}
              value={areaFilter}
              onValueChange={handleAreaChange}
              placeholder="Filtrar por área"
              searchPlaceholder="Buscar área..."
            />
            <Combobox
              options={technicianOptions}
              value={technicianFilter}
              onValueChange={(v) => { setTechnicianFilter(v); setPage(1); }}
              placeholder="Filtrar por responsable"
              searchPlaceholder="Buscar responsable..."
            />
            <Combobox
              options={machineOptions}
              value={machineFilter}
              onValueChange={(v) => { setMachineFilter(v); setPage(1); }}
              placeholder="Filtrar por equipo"
              searchPlaceholder="Buscar equipo..."
              disabled={!areaFilter}
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as ActivityStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estatus</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                <SelectItem value="COMPLETED">Realizado</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox
                id="priority-filter"
                checked={priorityFilter}
                onCheckedChange={(v) => { setPriorityFilter(!!v); setPage(1); }}
              />
              <label htmlFor="priority-filter" className="text-sm text-muted-foreground cursor-pointer">
                Solo prioritarias
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Área</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Equipo</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Responsables</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell cursor-pointer" onClick={() => toggleSort('START_DATE')}>
                    <span className="flex items-center gap-1">F. Inicio <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell cursor-pointer" onClick={() => toggleSort('END_DATE')}>
                    <span className="flex items-center gap-1">F. Fin <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold">Estatus</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Avance</th>
                  <th className="px-4 py-3 font-semibold hidden xl:table-cell">Comentarios</th>
                  <th className="px-4 py-3 font-semibold text-center">Prioridad</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading && !data && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!loading && activities.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron actividades
                    </td>
                  </tr>
                )}
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">{act.area?.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{act.machine?.name}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{act.activity}</td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-[180px] truncate">
                      {act.technicians
                        ?.map((t) =>
                          t.technician?.fullName ||
                          `${t.technician?.firstName ?? ''} ${t.technician?.lastName ?? ''}`.trim(),
                        )
                        .join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">{formatDate(act.startDate)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">{formatDate(act.endDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusColors[act.status] || ''}>
                        {statusLabels[act.status] || act.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${act.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{act.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell max-w-[150px] truncate text-muted-foreground">
                      {act.comments || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={act.priority}
                        onCheckedChange={() => handlePriorityToggle(act.id, act.priority)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewActivity(act)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/actividades/${act.id}/editar`)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/actividades/${act.id}/ordenes`)}>
                              <ClipboardList className="h-4 w-4 mr-2" /> Órdenes de trabajo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/actividades/${act.id}/solicitudes`)}>
                              <FileText className="h-4 w-4 mr-2" /> Solicitudes de material
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(act.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Confirmación: Eliminar actividad ─────────────────────── */}
      <AlertDialog open={!!deletingActivityId} onOpenChange={(open) => !open && setDeletingActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente y no se puede deshacer. La actividad y todos sus datos asociados serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Modal */}
      <Dialog open={!!viewActivity} onOpenChange={() => setViewActivity(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Actividad</DialogTitle>
          </DialogHeader>
          {viewActivity && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Área</p>
                  <p className="font-medium">{viewActivity.area?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Equipo</p>
                  <p className="font-medium">{viewActivity.machine?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Actividad</p>
                  <p className="font-medium">{viewActivity.activity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Inicio</p>
                  <p className="font-medium">{formatDate(viewActivity.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Fin</p>
                  <p className="font-medium">{formatDate(viewActivity.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estatus</p>
                  <Badge variant="secondary" className={statusColors[viewActivity.status] || ''}>
                    {statusLabels[viewActivity.status] || viewActivity.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avance</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${viewActivity.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{viewActivity.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prioridad</p>
                  <p className="font-medium">{viewActivity.priority ? 'Si' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Responsables</p>
                  <p className="font-medium">
                    {viewActivity.technicians
                      ?.map((t) =>
                        t.technician?.fullName ||
                        `${t.technician?.firstName ?? ''} ${t.technician?.lastName ?? ''}`.trim(),
                      )
                      .join(', ') || '-'}
                  </p>
                </div>
                {viewActivity.comments && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Comentarios</p>
                    <p className="font-medium">{viewActivity.comments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
