'use client';

import { useState } from 'react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ClipboardList, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';
import {
  MyRequestedWorkOrdersDocument,
  type WorkOrderStatus,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment, useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';

const PAGE_SIZE = 12;

export default function MisOrdenesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<WorkOrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, loading, error, isOffline } = useOfflineAwareQuery(MyRequestedWorkOrdersDocument, {
    skip: !user?.id,
  });

  const orders = useFragment(WorkOrderItemFragmentDoc, data?.myRequestedWorkOrders || []);

  if (loading && !data) {
    return <WorkOrderListSkeleton count={5} />;
  }

  if (error && !data) {
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

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesStatus = statusTab === 'all' || order.status === statusTab;
    const matchesSearch =
      !searchTerm ||
      order.folio?.toLowerCase().includes(term) ||
      order.description?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pageOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 pb-12">
      {isOffline && data && <OfflineBanner />}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mis órdenes
          </h1>
          <p className="text-muted-foreground">
            Todas las órdenes de trabajo que has solicitado
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/solicitante/crear-ot')}>
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
            onValueChange={(val) => setStatusTab(val as WorkOrderStatus | 'all')}
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
              <h3 className="text-lg font-semibold text-foreground">Sin resultados</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No se encontraron órdenes con los filtros actuales
              </p>
            </CardContent>
          </Card>
        ) : (
          pageOrders.map((order) => {
            const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
            const subArea = unmaskFragment(SubAreaBasicFragmentDoc, order.subArea);
            const leadTechRel = order.technicians?.find((t) => t.isLead);
            const leadTechnician = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);
            return (
              <WorkOrderCard
                key={order.id}
                id={order.id}
                folio={order.folio}
                status={order.status}
                description={order.description}
                createdAt={order.createdAt}
                area={area}
                subArea={subArea}
                leadTechnician={leadTechnician}
                showPendingSignature
                onClick={() => navigate(`/solicitante/ordenes/${order.id}`)}
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
