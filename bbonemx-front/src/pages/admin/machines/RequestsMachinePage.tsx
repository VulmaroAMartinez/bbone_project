import { useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Package } from 'lucide-react';
import { MaterialRequestCard } from '@/components/material-requests/MaterialRequestCard';

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

    type Request = typeof requests[0];
    const [viewingItemsReq, setViewingItemsReq] = useState<Request | null>(null);

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
                        <MaterialRequestCard
                            key={req.id}
                            id={req.id}
                            folio={req.folio}
                            category={req.category}
                            priority={req.priority}
                            importance={req.importance}
                            description={req.comments}
                            isActive={req.isActive}
                            createdAt={req.createdAt}
                            items={req.items}
                            onClick={() => navigate(`/solicitud-material/${req.id}`)}
                            onViewItems={() => setViewingItemsReq(req)}
                        />
                    ))}
                </div>
            )}

            {/* Dialog: detalles de artículos */}
            <Dialog open={!!viewingItemsReq} onOpenChange={(open) => !open && setViewingItemsReq(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Artículos — {viewingItemsReq?.folio}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {viewingItemsReq?.items.map((item, idx) => (
                            <div key={item.id} className="rounded-lg border border-border p-3 space-y-1 text-sm">
                                <p className="font-medium">
                                    {idx + 1}. {item.description ?? item.material?.description ?? '—'}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                                    <span>Cantidad: <span className="text-foreground">{item.requestedQuantity}</span></span>
                                    {item.unitOfMeasure && (
                                        <span>Unidad: <span className="text-foreground">{item.unitOfMeasure}</span></span>
                                    )}
                                </div>
                                {(item.brand ?? item.material?.brand) && (
                                    <p className="text-muted-foreground">
                                        Marca: <span className="text-foreground">{item.brand ?? item.material?.brand}</span>
                                    </p>
                                )}
                                {(item.partNumber ?? item.material?.partNumber) && (
                                    <p className="text-muted-foreground">
                                        Núm. parte: <span className="text-foreground">{item.partNumber ?? item.material?.partNumber}</span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
