import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import { 
  MyAssignedWorkOrdersDocument,
  WorkOrderItemFragmentDoc,
  AreaBasicFragmentDoc,
  MachineBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge } from '@/components/ui/status-badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Clock, MapPin, AlertTriangle, CheckCircle, ArrowRight, Wrench } from 'lucide-react';

function PendientesPage() {
  const navigate = useNavigate();

  const { data, loading, refetch } = useQuery(MyAssignedWorkOrdersDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const allAssignedOrders = unmaskFragment(WorkOrderItemFragmentDoc, data?.myAssignedWorkOrders || []);
  const pendingOrders = allAssignedOrders.filter(o => o.status === 'PENDING');

  if (loading && !data) return <WorkOrderListSkeleton count={3} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pendientes</h1>
          <p className="text-muted-foreground">
            {pendingOrders.length} órden(es) pendiente(s) de iniciar
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="bg-transparent">
          Actualizar
        </Button>
      </div>

      {/* Empty state */}
      {pendingOrders.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin órdenes pendientes
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              ¡Excelente trabajo! No tienes órdenes de trabajo pendientes de iniciar. Las nuevas asignaciones aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending orders list */}
      <div className="space-y-4">
        {pendingOrders.map((order) => {
          const area = unmaskFragment(AreaBasicFragmentDoc, order.area);
          const machine = unmaskFragment(MachineBasicFragmentDoc, order.machine);
          return (<Card
            key={order.id}
            className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer"
            onClick={() => navigate(`/tecnico/orden/${order.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-lg font-mono">{order.folio}</CardTitle>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{order.description}</p>
                </div>
                {order.priority && <PriorityBadge priority={order.priority} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {order.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {area?.name}
                  </span>
                )}
                {machine && (
                  <span className="flex items-center gap-1">
                    <Wrench className="h-4 w-4" />
                    {machine?.name}
                  </span>
                )}
                {order.maintenanceType && (
                  <MaintenanceTypeBadge type={order.maintenanceType} size="sm" />
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString('es-MX')}
                </span>
                
                {order.priority === 'CRITICAL' && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Urgente
                  </span>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" className="gap-2">
                  Ir al área de trabajo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>)
        })}
      </div>
    </div>
  );
}

export default PendientesPage;
