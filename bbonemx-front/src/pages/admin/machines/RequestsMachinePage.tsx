import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetMachineMaterialRequestsDocument } from '@/lib/graphql/generated/graphql';

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
import { ArrowLeft, Package, Calendar, Box } from 'lucide-react';

// ─── Helpers de prioridad ───────────────────────────────────

const priorityConfig: Record<string, { label: string; className: string }> = {
    CRITICAL: {
        label: 'Crítica',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    HIGH: {
        label: 'Alta',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    MEDIUM: {
        label: 'Media',
        className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    },
    LOW: {
        label: 'Baja',
        className: 'bg-primary/10 text-primary border-primary/20',
    },
};

const importanceConfig: Record<string, { label: string; className: string }> = {
    CRITICAL: {
        label: 'Crítica',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    HIGH: {
        label: 'Alta',
        className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    },
    MEDIUM: {
        label: 'Media',
        className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    },
    LOW: {
        label: 'Baja',
        className: 'bg-muted/60 text-muted-foreground border-border',
    },
};

function RequestPriorityBadge({ priority }: { priority: string }) {
    const config = priorityConfig[priority] ?? priorityConfig.LOW;
    return (
        <span
            className={`inline-flex items-center font-medium border rounded-full px-2 py-0.5 text-xs ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function ImportanceBadge({ importance }: { importance: string }) {
    const config = importanceConfig[importance] ?? importanceConfig.LOW;
    return (
        <span
            className={`inline-flex items-center font-medium border rounded-full px-1.5 py-0.5 text-[10px] ${config.className}`}
        >
            {config.label}
        </span>
    );
}

// ─── Componente principal ───────────────────────────────────

export default function RequestsMachinePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading } = useQuery(GetMachineMaterialRequestsDocument, {
        variables: { id: id! },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    const machine = data?.machine;
    const requests = machine?.materialRequests ?? [];

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
                    <h1 className="text-2xl font-bold text-foreground">Solicitudes de Material</h1>
                    {machine && (
                        <p className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-mono text-xs mr-1.5">
                                {machine.code}
                            </Badge>
                            {machine.name}
                            <span className="mx-1.5">·</span>
                            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
                        </p>
                    )}
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
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Package className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin solicitudes de material</EmptyTitle>
                        <EmptyDescription>
                            Esta máquina no tiene solicitudes de material asociadas.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <Card key={req.id} className="bg-card hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                {/* Fila: Folio + Prioridad + Importancia */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="font-mono font-semibold text-sm text-primary">
                                        {req.folio}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <RequestPriorityBadge priority={req.priority} />
                                        {req.importance && (
                                            <ImportanceBadge importance={req.importance} />
                                        )}
                                    </div>
                                </div>

                                {/* Texto de solicitud / comentarios */}
                                <p className="text-sm text-foreground line-clamp-2">
                                    {req.comments || 'Sin comentarios'}
                                </p>

                                {/* Justificación */}
                                {req.justification && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        <span className="font-medium">Justificación:</span> {req.justification}
                                    </p>
                                )}

                                {/* Indicadores */}
                                <div className="flex flex-wrap gap-1.5">
                                    {req.isGenericAllowed && (
                                        <span className="text-[10px] bg-chart-5/10 text-chart-5 border border-chart-5/20 px-1.5 py-0.5 rounded-full font-medium">
                                            Acepta genérico/alternativo
                                        </span>
                                    )}
                                    {req.suggestedSupplier && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                                            Proveedor: {req.suggestedSupplier}
                                        </span>
                                    )}
                                </div>

                                {/* Materiales solicitados */}
                                {req.items && req.items.length > 0 && (
                                    <div className="pt-2 border-t border-border/50 space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Materiales ({req.items.length})
                                        </p>
                                        <div className="space-y-1.5">
                                            {req.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-2 bg-muted/30 rounded-md p-2"
                                                >
                                                    <Box className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-foreground leading-tight truncate">
                                                            {item.description || item.material.description}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Cant:{' '}
                                                                <strong>{item.requestedQuantity}</strong>{' '}
                                                                {item.unitOfMeasure}
                                                            </span>
                                                            {item.material.partNumber && (
                                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                                    {item.material.partNumber}
                                                                </span>
                                                            )}
                                                            {item.material.brand && (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {item.material.brand}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(req.createdAt)}
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