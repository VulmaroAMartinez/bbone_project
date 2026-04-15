import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate } from 'react-router-dom';
import {
  GetShiftsDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  SubAreaBasicFragmentDoc,
  MachineBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';
import { GET_SCHEDULED_WORK_ORDERS_QUERY } from '@/lib/graphql/operations/work-orders';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';

const PAGE_SIZE = 12;

function OrdenesProgramadasPage() {
  const navigate = useNavigate();
  const [scheduledFrom, setScheduledFrom] = useState('');
  const [scheduledTo, setScheduledTo] = useState('');
  const [shiftId, setShiftId] = useState('all');
  const [page, setPage] = useState(1);

  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const { data, loading, error, isOffline } = useOfflineAwareQuery(GET_SCHEDULED_WORK_ORDERS_QUERY, {
    variables: {
      scheduledFrom: scheduledFrom || undefined,
      scheduledTo: scheduledTo || undefined,
      assignedShiftId: shiftId === 'all' ? undefined : shiftId,
    },
  });

  const orders = (((data as unknown as { workOrdersFiltered?: { data?: Array<unknown> } })?.workOrdersFiltered?.data || [])).map((ref) =>
    unmaskFragment(WorkOrderItemFragmentDoc, ref as never),
  );

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(a.scheduledDate || a.createdAt).getTime() - new Date(b.scheduledDate || b.createdAt).getTime()),
    [orders],
  );
  const totalPages = Math.ceil(sortedOrders.length / PAGE_SIZE);
  const pageOrders = sortedOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar órdenes programadas</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOffline && data != null && <OfflineBanner />}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Órdenes de Trabajo Programadas</h1>
          <p className="text-muted-foreground">{(data as unknown as { workOrdersFiltered?: { total?: number } })?.workOrdersFiltered?.total || 0} órdenes programadas</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/ordenes')}>Ver todas las órdenes</Button>
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="scheduled-from" className="text-sm">Fecha desde</label>
            <Input id="scheduled-from" type="date" value={scheduledFrom} onChange={(e) => { setScheduledFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-2">
            <label htmlFor="scheduled-to" className="text-sm">Fecha hasta</label>
            <Input id="scheduled-to" type="date" value={scheduledTo} onChange={(e) => { setScheduledTo(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-2">
            <label htmlFor="scheduled-shift" className="text-sm">Turno</label>
            <Select value={shiftId} onValueChange={setShiftId}>
              <SelectTrigger id="scheduled-shift"><SelectValue placeholder="Todos los turnos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los turnos</SelectItem>
                {(shiftsData?.shiftsActive || []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!loading && sortedOrders.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No hay órdenes programadas con los filtros seleccionados.</p>
            </CardContent>
          </Card>
        )}
        {pageOrders.map((order) => {
          const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
          const subArea = order.subArea ? unmaskFragment(SubAreaBasicFragmentDoc, order.subArea) : null;
          const machine = order.machine ? unmaskFragment(MachineBasicFragmentDoc, order.machine) : null;
          const leadTechRel = order.technicians?.find((t) => t.isLead);
          const leadTechnician = leadTechRel ? unmaskFragment(UserBasicFragmentDoc, leadTechRel.technician) : null;
          const requester = order.requester ? unmaskFragment(UserBasicFragmentDoc, order.requester) : null;

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
              subArea={subArea}
              machine={machine}
              leadTechnician={leadTechnician}
              requester={requester}
              onClick={() => navigate(`/admin/orden/${order.id}`)}
            />
          );
        })}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdenesProgramadasPage;
