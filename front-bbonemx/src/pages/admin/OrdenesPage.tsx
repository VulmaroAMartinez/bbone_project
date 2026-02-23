import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  GetWorkOrdersFilteredDocument,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Search,
  Filter,
  UserPlus,
  Calendar,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Wrench,
  ClipboardList,
} from 'lucide-react';

const STATUS_TABS: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'PAUSED', label: 'En Pausa' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'TEMPORARY_REPAIR', label: 'Reparación Temporal' },
];

const PRIORITY_TABS: { value: WorkOrderPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'CRITICAL', label: 'Críticas' },
  { value: 'HIGH', label: 'Altas' },
  { value: 'MEDIUM', label: 'Medias' },
  { value: 'LOW', label: 'Bajas' },
];

function OrdenesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>(
    (searchParams.get('status') as WorkOrderStatus) || 'all'
  );

  const handleStatusChange = (val: WorkOrderStatus | 'all') => {
    setStatusFilter(val);
    if (val !== 'all') {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');

  const { data, loading, error, refetch } = useQuery(GetWorkOrdersFilteredDocument, {
    variables: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    },
    fetchPolicy: 'cache-and-network',
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

  if (loading && !data) return <WorkOrderListSkeleton count={5} />;

  if (error) {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestion de Ordenes de Trabajo
          </h1>
          <p className="text-muted-foreground">
            {data?.workOrdersFiltered.total || 0} órden(es) en total ({filteredOrders.length} visibles)          </p>
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
                placeholder="Buscar por folio, descripcion o maquina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(val) => handleStatusChange(val as WorkOrderStatus | 'all')}>                <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
                <SelectContent>
                  {STATUS_TABS.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as WorkOrderPriority | 'all')}>                <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
                <SelectContent>
                  {PRIORITY_TABS.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
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
          filteredOrders.map((order) => {
            const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
            const machine = unmaskFragment(MachineBasicFragmentDoc, order.machine);

            const leadTechRel = order.technicians?.find(t => t.isLead);
            const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);

            return (
              <Card
                key={order.id}
                className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all shadow-sm cursor-pointer group"
                onClick={() => navigate(`/admin/ordenes/${order.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">{order.folio}</span>
                        <StatusBadge status={order.status} />
                        {order.priority && <PriorityBadge priority={order.priority} size="sm" />}
                        {order.maintenanceType && <MaintenanceTypeBadge type={order.maintenanceType} size="sm" />}
                      </div>

                      <p className="text-sm text-foreground line-clamp-2">{order.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
                        {area && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{area.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
                        </div>
                        {leadTechnician && (
                          <div className="flex items-center gap-1.5 font-medium text-primary/80">
                            <UserPlus className="h-4 w-4" />
                            <span>Líder: {leadTechnician.firstName} {leadTechnician.lastName}</span>
                          </div>
                        )}
                        {machine && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Wrench className="h-4 w-4" />
                            <span>{machine.name} [{machine.code}]</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 hidden md:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default OrdenesPage;
