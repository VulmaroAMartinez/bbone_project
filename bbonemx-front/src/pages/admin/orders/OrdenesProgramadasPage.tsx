import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import {
  GetShiftsDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';
import { GET_SCHEDULED_WORK_ORDERS_QUERY } from '@/lib/graphql/operations/work-orders';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, MapPin, UserPlus, AlertTriangle } from 'lucide-react';

function OrdenesProgramadasPage() {
  const navigate = useNavigate();
  const [scheduledFrom, setScheduledFrom] = useState('');
  const [scheduledTo, setScheduledTo] = useState('');
  const [shiftId, setShiftId] = useState('all');

  const { data: shiftsData } = useQuery(GetShiftsDocument);
  const { data, loading, error } = useQuery(GET_SCHEDULED_WORK_ORDERS_QUERY, {
    variables: {
      scheduledFrom: scheduledFrom || undefined,
      scheduledTo: scheduledTo || undefined,
      assignedShiftId: shiftId === 'all' ? undefined : shiftId,
    },
    fetchPolicy: 'cache-and-network',
  });

  const orders = (((data as unknown as { workOrdersFiltered?: { data?: Array<unknown> } })?.workOrdersFiltered?.data || [])).map((ref) =>
    unmaskFragment(WorkOrderItemFragmentDoc, ref as never),
  );

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(a.scheduledDate || a.createdAt).getTime() - new Date(b.scheduledDate || b.createdAt).getTime()),
    [orders],
  );

  if (error) {
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
            <Input id="scheduled-from" type="date" value={scheduledFrom} onChange={(e) => setScheduledFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="scheduled-to" className="text-sm">Fecha hasta</label>
            <Input id="scheduled-to" type="date" value={scheduledTo} onChange={(e) => setScheduledTo(e.target.value)} />
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
            <CardContent className="py-10 text-center text-muted-foreground">No hay órdenes programadas con los filtros seleccionados.</CardContent>
          </Card>
        )}
        {sortedOrders.map((order) => {
          const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
          const leadTechRel = order.technicians?.find((t) => t.isLead);
          const leadTech = unmaskFragment(UserBasicFragmentDoc, leadTechRel?.technician);

          return (
            <Card key={order.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/admin/orden/${order.id}`)}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-primary">{order.folio}</p>
                  <p className="text-sm line-clamp-1">{order.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('es-MX') : '--'}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {area?.name || '--'}</span>
                    <span className="inline-flex items-center gap-1"><UserPlus className="h-3 w-3" /> {leadTech?.fullName || 'Sin líder'}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default OrdenesProgramadasPage;
