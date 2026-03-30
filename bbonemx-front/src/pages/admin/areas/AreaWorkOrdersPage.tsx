import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  GetWorkOrdersByAreaDocument,
  GetAreaDocument,
  AreaDetailFragmentDoc,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type MaintenanceType,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import { ArrowLeft, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_LIMIT = 12;

export default function AreaWorkOrdersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: areaData } = useQuery(GetAreaDocument, {
    variables: { id: id! },
    skip: !id,
  });

  const { data, loading } = useQuery(GetWorkOrdersByAreaDocument, {
    variables: { areaId: id!, page, limit: PAGE_LIMIT },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const area = areaData?.area ? unmaskFragment(AreaDetailFragmentDoc, areaData.area) : null;
  const result = data?.workOrdersFiltered;
  const workOrders = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/areas')}
          className="gap-1.5 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Áreas
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Órdenes de Trabajo</h1>
          {area && (
            <p className="text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs mr-1.5">
                {area.name}
              </Badge>
              {result ? `${result.total} orden${result.total !== 1 ? 'es' : ''}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
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
              Esta área no tiene órdenes de trabajo asociadas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
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
                subArea={wo.subArea ?? null}
                machine={wo.machine ?? null}
                requester={wo.requester ?? null}
                onClick={() => navigate(`/admin/orden/${wo.id}`)}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
