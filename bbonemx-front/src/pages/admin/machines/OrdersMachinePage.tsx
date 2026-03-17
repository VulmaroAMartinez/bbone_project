import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetMachineWorkOrdersDocument } from '@/lib/graphql/generated/graphql';
import type { WorkOrderStatus, WorkOrderPriority, MaintenanceType } from '@/lib/graphql/generated/graphql';

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
import {
    StatusBadge,
    PriorityBadge,
    MaintenanceTypeBadge,
} from '@/components/ui/status-badge';
import { ArrowLeft, ClipboardList, Calendar, User } from 'lucide-react';

export default function OrdersMachinePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading } = useQuery(GetMachineWorkOrdersDocument, {
        variables: { id: id! },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    // Query actual no devuelve machine; solo usamos workOrdersFiltered.
    const workOrders = (data as any)?.workOrdersFiltered?.data ?? [];

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

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
                    <ArrowLeft className="h-4 w-4" /> Máquinas
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
                    {workOrders.map((wo: any) => (
                        <Card key={wo.id} className="bg-card hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                {/* Fila: Folio + Status */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="font-mono font-semibold text-sm text-primary">
                                        {wo.folio}
                                    </span>
                                    <StatusBadge status={wo.status as WorkOrderStatus} size="sm" />
                                </div>

                                {/* Descripción */}
                                <p className="text-sm text-foreground line-clamp-2">{wo.description}</p>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1.5">
                                    {wo.priority && (
                                        <PriorityBadge priority={wo.priority as WorkOrderPriority} size="sm" />
                                    )}
                                    {wo.maintenanceType && (
                                        <MaintenanceTypeBadge type={wo.maintenanceType as MaintenanceType} size="sm" />
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                                    {wo.area && (
                                        <span>{wo.area.name}</span>
                                    )}
                                    {wo.requester && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {wo.requester.fullName}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(wo.createdAt)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}