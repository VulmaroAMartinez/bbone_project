'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';

import {
  MyAssignedWorkOrdersDocument,
  type WorkOrderStatus,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  MachineBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Search, ClipboardList, Clock, CheckCircle, Wrench, AlertTriangle, Pause, MapPin, ChevronRight
} from 'lucide-react';

export default function AsignacionesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<WorkOrderStatus | 'all'>('all');

  const { data, loading, error } = useQuery(MyAssignedWorkOrdersDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const orders = useFragment(WorkOrderItemFragmentDoc, data?.myAssignedWorkOrders || []);

  if (loading && !data) return <WorkOrderListSkeleton count={5} />;

  if (error) {
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

  // Filtrado local super rápido
  const filteredOrders = orders.filter((order) => {
    const machine = useFragment(MachineBasicFragmentDoc, order.machine);

    const matchesStatus = statusTab === 'all' || order.status === statusTab;
    const matchesSearch = !searchTerm ||
      order.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Contadores para las tarjetas de estadísticas
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const progressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const pausedCount = orders.filter((o) => o.status === 'PAUSED').length;
  const completedandTemporaryRepairCount = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'TEMPORARY_REPAIR').length;

  return (
    <div className="space-y-6 pb-12">
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
            placeholder="Buscar por folio, descripción o máquina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto pb-1 md:pb-0">
          <Tabs value={statusTab} onValueChange={(val) => setStatusTab(val as WorkOrderStatus | 'all')} className="w-max">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value={'PENDING'}>Pendientes</TabsTrigger>
              <TabsTrigger value={'IN_PROGRESS'}>En Progreso</TabsTrigger>
              <TabsTrigger value={'PAUSED'}>En Pausa</TabsTrigger>
              <TabsTrigger value={'COMPLETED'}>Completadas</TabsTrigger>
              <TabsTrigger value={'TEMPORARY_REPAIR'}>Reparación Temporal</TabsTrigger>
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
          filteredOrders.map((order) => {
            const area = useFragment(AreaBasicFragmentDoc, order.area);
            const machine = useFragment(MachineBasicFragmentDoc, order.machine);

            return (
              <Card
                key={order.id}
                className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all shadow-sm group cursor-pointer"
                onClick={() => navigate(`/tecnico/orden/${order.id}`)}
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
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {area.name}
                          </span>
                        )}
                        {machine && (
                          <span className="flex items-center gap-1 font-medium text-foreground/70">
                            <Wrench className="h-3 w-3" />
                            {machine.name} [{machine.code}]
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString('es-MX')}
                        </span>
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