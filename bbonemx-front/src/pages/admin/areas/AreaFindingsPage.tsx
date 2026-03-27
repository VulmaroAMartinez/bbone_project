import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
    GetFindingsByAreaDocument,
    GetAreaDocument,
    AreaDetailFragmentDoc,
    type FindingStatus,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    AlertTriangle,
    Calendar,
    Cog,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
} from 'lucide-react';

const PAGE_LIMIT = 12;

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

    // ─── State: Paginación y filtros
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<FindingStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // ─── Queries
    const { data: areaData } = useQuery(GetAreaDocument, {
        variables: { id: id! },
        skip: !id,
    });

    const { data, loading } = useQuery(GetFindingsByAreaDocument, {
        variables: {
            areaId: id!,
            page,
            limit: PAGE_LIMIT,
            // Pasar filtros solo si tienen valor
            ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
            ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
            ...(dateFrom ? { createdFrom: new Date(dateFrom + 'T00:00:00').toISOString() } : {}),
            ...(dateTo ? { createdTo: new Date(dateTo + 'T23:59:59').toISOString() } : {}),
        },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    // ─── Derived
    const area = areaData?.area ? unmaskFragment(AreaDetailFragmentDoc, areaData.area) : null;
    const result = data?.findingsFiltered;
    const findings = result?.data ?? [];
    const totalPages = result?.totalPages ?? 1;

    const hasFilters = statusFilter !== 'ALL' || searchTerm || dateFrom || dateTo;

    // ─── Handlers
    const clearFilters = () => {
        setStatusFilter('ALL');
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value as FindingStatus | 'ALL');
        setPage(1);
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        setPage(1);
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        setPage(1);
    };

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

            {/* ── Filtros ────────────────────────────────────── */}
            <div className="space-y-2">
                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio o descripción..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Fila de filtros */}
                <div className="flex flex-wrap gap-2">
                    {/* Status */}
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="OPEN">Abiertos</SelectItem>
                            <SelectItem value="CONVERTED_TO_WO">Convertidos a OT</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Fecha desde */}
                    <div className="relative">
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            className="h-8 text-xs w-[150px]"
                            placeholder="Desde"
                            max={dateTo || undefined}
                        />
                    </div>

                    {/* Fecha hasta */}
                    <div className="relative">
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => handleDateToChange(e.target.value)}
                            className="h-8 text-xs w-[150px]"
                            placeholder="Hasta"
                            min={dateFrom || undefined}
                        />
                    </div>

                    {/* Limpiar filtros */}
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 text-xs gap-1 text-muted-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Content ─────────────────────────────────── */}
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
                        <EmptyTitle>
                            {hasFilters ? 'Sin resultados' : 'Sin hallazgos'}
                        </EmptyTitle>
                        <EmptyDescription>
                            {hasFilters
                                ? 'No se encontraron hallazgos con los filtros actuales.'
                                : 'Esta área no tiene hallazgos registrados.'}
                        </EmptyDescription>
                        {hasFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="mt-3"
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <div className="space-y-3">
                        {findings.map((finding) => {
                            const statusCfg =
                                STATUS_CONFIG[finding.status] ?? STATUS_CONFIG.OPEN;
                            return (
                                <Card
                                    key={finding.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/hallazgos/${finding.id}/editar`)}
                                >
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
                                            <Badge variant="secondary" className="text-xs">
                                                OT: {finding.convertedToWo.folio}
                                            </Badge>
                                        )}

                                        {/* Meta info */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            {finding.machine && (
                                                <span className="flex items-center gap-1">
                                                    <Cog className="h-3.5 w-3.5" />
                                                    {finding.machine.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(finding.createdAt)}
                                            </span>
                                            {finding.shift && (
                                                <span>Turno: {finding.shift.name}</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-muted-foreground">
                                Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}