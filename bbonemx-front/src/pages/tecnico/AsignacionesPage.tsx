import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';

import {
  MyAssignedWorkOrdersDocument,
  type WorkOrderStatus,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment, useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import {
  Search,
  ClipboardList,
  Clock,
  CheckCircle,
  Wrench,
  AlertTriangle,
  Pause,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfflineBanner } from '@/components/ui/offline-banner';

const PAGE_SIZE = 12;

export default function AsignacionesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<WorkOrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, loading, error, isOffline } = useOfflineAwareQuery(MyAssignedWorkOrdersDocument);

  const orders = useFragment(WorkOrderItemFragmentDoc, data?.myAssignedWorkOrders || []);

  if (loading && !data) return <WorkOrderListSkeleton count={5} />;

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar asignaciones</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const machine = unmaskFragment(MachineBasicFragmentDoc, order.machine);
    const matchesStatus = statusTab === 'all' || order.status === statusTab;
    const matchesSearch =
      !searchTerm ||
      order.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pageOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const progressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const pausedCount = orders.filter((o) => o.status === 'PAUSED').length;
  const completedandTemporaryRepairCount = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'TEMPORARY_REPAIR'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {isOffline && data && <OfflineBanner />}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Historial de Asignaciones</h1>
        <p className="text-muted-foreground">Todas las órdenes de trabajo que has atendido o tienes pendientes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 text-chart-3 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 text-center">
            <Wrench className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{progressCount}</p>
            <p className="text-xs text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 text-center">
            <Pause className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{pausedCount}</p>
            <p className="text-xs text-muted-foreground">En Pausa</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedandTemporaryRepairCount}</p>
            <p className="text-xs text-muted-foreground">Completadas o Reparadas temporalmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por folio, descripción o equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto pb-1 md:pb-0">
          <Tabs value={statusTab} onValueChange={(val) => setStatusTab(val as WorkOrderStatus | 'all')} className="w-max">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="PENDING">Pendientes</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">En Progreso</TabsTrigger>
              <TabsTrigger value="PAUSED">En Pausa</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completadas</TabsTrigger>
              <TabsTrigger value="TEMPORARY_REPAIR">Reparación Temporal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

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
                onClick={() => navigate(`/tecnico/orden/${order.id}`)}
              />
            );
          })
        )}
      </div>
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
  );
}
