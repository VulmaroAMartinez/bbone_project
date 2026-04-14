import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  GetWorkOrdersFilteredDocument,
  GetShiftsDocument,
  GetAreasDocument,
  type WorkOrderStatus,
  type WorkOrderPriority,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import {
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
} from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';

const STATUS_TABS: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'PAUSED', label: 'En Pausa' },
  { value: 'FINISHED', label: 'Finalizadas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'TEMPORARY_REPAIR', label: 'Reparación Temporal' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const PRIORITY_TABS: { value: WorkOrderPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'CRITICAL', label: 'Críticas' },
  { value: 'HIGH', label: 'Altas' },
  { value: 'MEDIUM', label: 'Medias' },
  { value: 'LOW', label: 'Bajas' },
];

const PAGE_SIZE = 12;

const STATUS_VALUES = new Set(STATUS_TABS.map((t) => t.value));

function parseStatusFromSearchParams(status: string | null): WorkOrderStatus | 'all' {
  if (!status || !STATUS_VALUES.has(status as WorkOrderStatus | 'all')) return 'all';
  return status as WorkOrderStatus | 'all';
}

function OrdenesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>(() =>
    parseStatusFromSearchParams(searchParams.get('status')),
  );
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');

  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const { data: areasData } = useQuery(GetAreasDocument);
  const areas = useMemo(() => {
    const raw = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
    const seen = new Set<string>();
    return raw.filter((a) => {
      const id = String(a.id ?? '');
      if (!id || id === 'all' || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [areasData?.areas]);

  const areaComboboxOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas las áreas' },
      ...areas.map((a) => ({ value: a.id, label: a.name })),
    ],
    [areas],
  );

  useEffect(() => {
    if (areaFilter === 'all') return;
    if (!areas.length) return;
    if (!areas.some((a) => a.id === areaFilter)) {
      setAreaFilter('all');
    }
  }, [areas, areaFilter]);

  useEffect(() => {
    if (shiftFilter === 'all') return;
    const shifts = shiftsData?.shiftsActive ?? [];
    if (!shifts.length) return;
    if (!shifts.some((s) => s.id === shiftFilter)) {
      setShiftFilter('all');
    }
  }, [shiftsData?.shiftsActive, shiftFilter]);

  const handleStatusChange = (val: WorkOrderStatus | 'all') => {
    setStatusFilter(val);
    setPage(1);
    if (val !== 'all') {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const { data, loading, error, isOffline } = useOfflineAwareQuery(GetWorkOrdersFilteredDocument, {
    variables: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      assignedShiftId: shiftFilter !== 'all' ? shiftFilter : undefined,
      areaId: areaFilter !== 'all' ? areaFilter : undefined,
    },
  });

  const workOrders = unmaskFragment(WorkOrderItemFragmentDoc, data?.workOrdersFiltered.data || []);

  const filteredOrders = workOrders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const machine = unmaskFragment(MachineBasicFragmentDoc, order.machine);
    return (
      order.folio?.toLowerCase().includes(term) ||
      order.description?.toLowerCase().includes(term) ||
      machine?.name?.toLowerCase().includes(term) ||
      machine?.code?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pageOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading && !data) return <WorkOrderListSkeleton count={5} />;

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar ordenes</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOffline && data && <OfflineBanner />}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestion de Ordenes de Trabajo
          </h1>
          <p className="text-muted-foreground">
            {data?.workOrdersFiltered.total || 0} órden(es) en total ({filteredOrders.length} visibles)
          </p>
        </div>
        <Button onClick={() => navigate('/admin/crear-ot')}>
          Crear nueva Orden de Trabajo
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <label htmlFor="orders-search" className="sr-only">Buscar órdenes</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="orders-search"
                placeholder="Buscar por folio, descripcion o equipo..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <Combobox
                options={areaComboboxOptions}
                value={areaFilter}
                onValueChange={(val) => {
                  setAreaFilter(val);
                  setPage(1);
                }}
                placeholder="Área"
                searchPlaceholder="Buscar área..."
                emptyText="Sin coincidencias"
                triggerClassName="w-[160px] shrink-0 justify-between"
                listClassName="max-h-[min(20rem,45vh)]"
              />
              <Select value={statusFilter} onValueChange={(val) => handleStatusChange(val as WorkOrderStatus | 'all')}>
                <SelectTrigger className="w-[160px] shrink-0">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_TABS.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={shiftFilter} onValueChange={(v) => { setShiftFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px] shrink-0">
                  <SelectValue placeholder="Turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los turnos</SelectItem>
                  {(shiftsData?.shiftsActive || []).map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <div className="px-5">
          <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val as WorkOrderPriority | 'all'); setPage(1); }}>
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="py-16 text-center animate-in fade-in">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Sin resultados</h3>
              <p className="text-sm text-muted-foreground mt-1">No se encontraron órdenes con los filtros actuales</p>
            </CardContent>
          </Card>
        ) : (
          pageOrders.map((order) => {
            const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
            const machine = unmaskFragment(MachineBasicFragmentDoc, order.machine);
            const leadTechRel = order.technicians?.find((t) => t.isLead);
            const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);
            return (
              <WorkOrderCard
                key={order.id}
                id={order.id}
                folio={order.folio}
                status={order.status}
                priority={order.priority}
                maintenanceType={order.maintenanceType}
                description={order.description}
                createdAt={order.createdAt}
                area={area}
                machine={machine}
                leadTechnician={leadTechnician}
                onClick={() => navigate(`/admin/orden/${order.id}`)}
              />
            );
          })
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdenesPage;
