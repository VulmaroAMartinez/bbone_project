import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetMachineWorkOrdersDocument } from '@/lib/graphql/generated/graphql';
import type { GetMachineWorkOrdersQuery, WorkOrderStatus, WorkOrderPriority, MaintenanceType } from '@/lib/graphql/generated/graphql';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export default function OrdersMachinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading } = useQuery<GetMachineWorkOrdersQuery>(GetMachineWorkOrdersDocument, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const workOrders = data?.machine?.workOrders ?? [];

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/maquinas')}
          className="gap-1.5 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Equipos/Estructuras
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Órdenes de Trabajo</h1>
          <p className="text-sm text-muted-foreground">
            {workOrders.length} orden{workOrders.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workOrders.length === 0 ? (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Sin órdenes de trabajo</EmptyTitle>
            <EmptyDescription>
              Esta máquina no tiene órdenes de trabajo asociadas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <WorkOrderCard
              key={wo.id}
              id={wo.id}
              folio={wo.folio}
              status={wo.status as WorkOrderStatus}
              priority={wo.priority as WorkOrderPriority | null | undefined}
              maintenanceType={wo.maintenanceType as MaintenanceType | null | undefined}
              description={wo.description}
              createdAt={wo.createdAt}
              area={wo.area ?? null}
              requester={wo.requester ?? null}
              onClick={() => navigate(`/admin/orden/${wo.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
