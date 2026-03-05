import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
    GetFindingsByAreaDocument,
    GetAreaDocument,
    AreaDetailFragmentDoc,
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
import {
    ArrowLeft,
    AlertTriangle,
    Calendar,
    Cog,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const PAGE_LIMIT = 20;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    OPEN: {
        label: 'Abierto',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        className: 'bg-yellow-100 text-yellow-700',
    },
    CONVERTED_TO_WO: {
        label: 'Convertido a OT',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className: 'bg-green-100 text-green-700',
    },
};

export default function AreaFindingsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    const { data: areaData } = useQuery(GetAreaDocument, {
        variables: { id: id! },
        skip: !id,
    });

    const { data, loading } = useQuery(GetFindingsByAreaDocument, {
        variables: { areaId: id!, page, limit: PAGE_LIMIT },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    const area = areaData?.area ? unmaskFragment(AreaDetailFragmentDoc, areaData.area) : null;
    const result = data?.findingsFiltered;
    const findings = result?.data ?? [];
    const totalPages = result?.totalPages ?? 1;

    const formatDate = (d?: string | null) =>
        d
            ? new Date(d).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
              })
            : '—';

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
                    <h1 className="text-2xl font-bold text-foreground">Hallazgos</h1>
                    {area && (
                        <p className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs mr-1.5">
                                {area.name}
                            </Badge>
                            {result ? `${result.total} hallazgo${result.total !== 1 ? 's' : ''}` : ''}
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
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : findings.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <AlertTriangle className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin hallazgos</EmptyTitle>
                        <EmptyDescription>
                            Esta área no tiene hallazgos registrados.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <div className="space-y-3">
                        {findings.map((finding) => {
                            const statusCfg =
                                STATUS_CONFIG[finding.status] ?? STATUS_CONFIG.OPEN;
                            return (
                                <Card key={finding.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 space-y-3">
                                        {/* Folio + Status */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="font-mono font-semibold text-sm text-primary">
                                                {finding.folio}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}
                                            >
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        {/* Descripción */}
                                        <p className="text-sm text-foreground line-clamp-2">
                                            {finding.description}
                                        </p>

                                        {/* OT vinculada */}
                                        {finding.convertedToWo && (
                                            <Badge variant="outline" className="text-xs font-mono">
                                                OT: {finding.convertedToWo.folio}
                                            </Badge>
                                        )}

                                        {/* Metadata */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                                            {finding.machine && (
                                                <span className="flex items-center gap-1">
                                                    <Cog className="h-3 w-3" />
                                                    {finding.machine.name}
                                                </span>
                                            )}
                                            {finding.shift && (
                                                <span>{finding.shift.name}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(finding.createdAt)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
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