import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/contexts/auth-context';
import {
  GET_OVERTIME_RECORDS_QUERY,
  GET_MY_OVERTIME_RECORDS_QUERY,
  GET_ACTIVE_TECHNICIANS_QUERY,
  GET_POSITIONS_QUERY,
} from '@/lib/graphql/operations/overtime';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Eye,
  Clock,
  Filter,
  X,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiBaseUrl } from '@/lib/utils/uploads';
import { downloadBlob } from '@/lib/utils/excel-download';

import { OvertimeFormModal } from './modals/OvertimeFormModal';
import { OvertimeViewModal } from './modals/OvertimeViewModal';

// ── Types (exported for modal components) ─────────────
export interface OvertimeRecord {
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

export interface TechnicianOption {
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

// ── Enums / Labels (exported for modal components) ────
export const REASON_FOR_PAYMENT_OPTIONS = [
  { value: 'HOLIDAY', label: 'Dia festivo' },
  { value: 'WORK_BREAK', label: 'Descanso laboral' },
  { value: 'OVERTIME', label: 'Tiempo extra' },
];

export const getReasonLabel = (reason: string | null) => {
  if (!reason) return '—';
  return REASON_FOR_PAYMENT_OPTIONS.find((o) => o.value === reason)?.label ?? reason;
};

export const getReasonBadgeVariant = (reason: string | null): 'default' | 'secondary' | 'outline' => {
  if (!reason) return 'outline';
  switch (reason) {
    case 'HOLIDAY': return 'default';
    case 'WORK_BREAK': return 'secondary';
    case 'OVERTIME': return 'default';
    default: return 'outline';
  }
};

// ── Helper ────────────────────────────────────────────
export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ── Page ──────────────────────────────────────────────
export default function OvertimePage() {
  const { isAdmin } = useAuth();

  // ── State ──
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<OvertimeRecord | null>(null);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPositionId, setFilterPositionId] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [exporting, setExporting] = useState(false);

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

  const openCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const openEdit = (record: OvertimeRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const openView = (record: OvertimeRecord) => {
    setViewRecord(record);
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
  const baseName = `horas-extra-${new Date().toISOString().split('T')[0]}`;
  const excelFilename = `${baseName}.xlsx`;
  const pdfFilename = `${baseName}.pdf`;

  const exportBody = {
    filters: {
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
      positionId: filterPositionId || undefined,
      reasonForPayment: filterReason || undefined,
    },
    periodFrom: filterStartDate || undefined,
    periodTo: filterEndDate || undefined,
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/overtime/export/excel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...exportBody,
          filename: excelFilename,
        }),
      });

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
      const response = await fetch(`${getApiBaseUrl()}/api/overtime/export/pdf`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...exportBody,
          filename: pdfFilename,
        }),
      });

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

  // ── Render ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horas Extra</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestion de horas extra de todos los tecnicos' : 'Mis registros de horas extra'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting}>
                  <Download className="mr-2 h-4 w-4" />
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
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar
          </Button>
        </div>
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
                  <Label className="text-xs">Razon de pago</Label>
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
                      <TableHead>No. Nómina</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Puesto</TableHead>
                    </>
                  )}
                  <TableHead>Fecha</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Razon de pago</TableHead>
                  <TableHead>Actividad</TableHead>
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
                      <TableCell>{record.activity}</TableCell>
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

      {/* ── Form Modal (Create / Edit) ── */}
      <OvertimeFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingRecord(null);
        }}
        record={editingRecord}
        isAdmin={isAdmin}
        technicians={technicians}
        onSuccess={() => refetch()}
      />

      {/* ── View Modal ── */}
      <OvertimeViewModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewRecord(null);
        }}
        record={viewRecord}
      />
    </div>
  );
}
