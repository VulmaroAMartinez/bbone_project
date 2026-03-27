import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetMachineSparePartsDocument, type MachineBasicFragment } from '@/lib/graphql/generated/graphql';

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
import { ArrowLeft, Wrench, Calendar, Tag, Building2, Ruler } from 'lucide-react';

export default function SparePartsMachinePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading } = useQuery(GetMachineSparePartsDocument, {
        variables: { id: id! },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    const machine = (data as unknown as { machine?: MachineBasicFragment })?.machine ?? null;
    const spareParts = (data as unknown as { sparePartsByMachine?: Array<SparePartData> })?.sparePartsByMachine ?? [];

    // Separar activas / inactivas
    const activeParts = spareParts.filter((sp) => sp.isActive);
    const inactiveParts = spareParts.filter((sp) => !sp.isActive);

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
                    <ArrowLeft className="h-4 w-4" /> Equipos/Estructuras
                </Button>

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Refacciones</h1>
                    {machine && (
                        <p className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-mono text-xs mr-1.5">
                                {machine?.code}
                            </Badge>
                            {machine.name}
                            <span className="mx-1.5">·</span>
                            {activeParts.length} activa{activeParts.length !== 1 ? 's' : ''}
                            {inactiveParts.length > 0 && (
                                <span className="text-muted-foreground/60">
                                    {' '}/ {inactiveParts.length} inactiva{inactiveParts.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-20" />
                                <div className="flex gap-2 pt-1">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : spareParts.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Wrench className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin refacciones</EmptyTitle>
                        <EmptyDescription>
                            Esta máquina no tiene refacciones registradas.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="space-y-6">
                    {/* Activas */}
                    {activeParts.length > 0 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeParts.map((sp) => (
                                    <SparePartCard key={sp.id} sparePart={sp} formatDate={formatDate} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inactivas */}
                    {inactiveParts.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Inactivas ({inactiveParts.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inactiveParts.map((sp) => (
                                    <SparePartCard
                                        key={sp.id}
                                        sparePart={sp}
                                        formatDate={formatDate}
                                        inactive
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Card de refacción ──────────────────────────────────────

interface SparePartData {
    id: string;
    partNumber: string;
    brand?: string | null;
    model?: string | null;
    supplier?: string | null;
    unitOfMeasure?: string | null;
    isActive: boolean;
    createdAt: string;
}

interface SparePartCardProps {
    sparePart: SparePartData;
    formatDate: (d?: string | null) => string;
    inactive?: boolean;
}

function SparePartCard({ sparePart, formatDate, inactive }: SparePartCardProps) {
    return (
        <Card
            className={`bg-card hover:shadow-md transition-shadow ${inactive ? 'opacity-55' : ''}`}
        >
            <CardContent className="p-4 space-y-2.5">
                {/* Número de parte + estado */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Tag className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-mono font-semibold text-sm text-foreground truncate">
                            {sparePart.partNumber}
                        </span>
                    </div>
                    {inactive && (
                        <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                            Inactiva
                        </span>
                    )}
                </div>

                {/* Detalles */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {sparePart.brand && (
                        <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {sparePart.brand}
                        </span>
                    )}
                    {sparePart.model && (
                        <span>Modelo: {sparePart.model}</span>
                    )}
                    {sparePart.unitOfMeasure && (
                        <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            {sparePart.unitOfMeasure}
                        </span>
                    )}
                    {sparePart.supplier && (
                        <span>Proveedor: {sparePart.supplier}</span>
                    )}
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 pt-0.5">
                    <Calendar className="h-3 w-3" />
                    Registrada {formatDate(sparePart.createdAt)}
                </div>
            </CardContent>
        </Card>
    );
}