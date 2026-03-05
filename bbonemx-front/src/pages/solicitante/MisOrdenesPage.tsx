'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Clock,
  MapPin,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  Pen,
  User,
} from 'lucide-react';
import {
  MyRequestedWorkOrdersDocument,
  type WorkOrderStatus,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

export default function MisOrdenesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<WorkOrderStatus | 'all'>('all');

  const { data, loading, error } = useQuery(MyRequestedWorkOrdersDocument, {
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const orders = useFragment(
    WorkOrderItemFragmentDoc,
    data?.myRequestedWorkOrders || []
  );

  if (loading && !data) {
    return <WorkOrderListSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Error al cargar tus órdenes
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Filtrado local: solo por folio y descripción
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesStatus =
      statusTab === 'all' || order.status === statusTab;
    const matchesSearch =
      !searchTerm ||
      order.folio?.toLowerCase().includes(term) ||
      order.description?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mis órdenes
          </h1>
          <p className="text-muted-foreground">
            Todas las órdenes de trabajo que has solicitado
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => navigate('/solicitante/crear-ot')}
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>  

      {/* Filters & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por folio o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto pb-1 md:pb-0">
          <Tabs
            value={statusTab}
            onValueChange={(val) =>
              setStatusTab(val as WorkOrderStatus | 'all')
            }
            className="w-max"
          >
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
              <h3 className="text-lg font-semibold text-foreground">
                Sin resultados
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                No se encontraron órdenes con los filtros actuales
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const area = useFragment(AreaBasicFragmentDoc, order.area);
            const subArea = order.subArea
              ? useFragment(SubAreaBasicFragmentDoc, order.subArea)
              : null;
            const leadTechRel = order.technicians?.find(t => t.isLead);
            const leadTechnician = useFragment(UserBasicFragmentDoc, leadTechRel?.technician);

            return (
              <Card
                key={order.id}
                className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all shadow-sm group cursor-pointer"
                onClick={() => navigate(`/solicitante/ordenes/${order.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                          {order.folio}
                        </span>
                        <StatusBadge status={order.status} />
                        {order.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Pen className="h-3 w-3" /> Firma pendiente
                          </span>
                        )}
                        
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {order.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
                        {area && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {area.name}
                            {subArea ? ` - ${subArea.name}` : ''}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString(
                            'es-MX'
                          )}
                        </span>
                        {leadTechnician && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {leadTechnician.firstName} {leadTechnician.lastName}
                          </span>
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
