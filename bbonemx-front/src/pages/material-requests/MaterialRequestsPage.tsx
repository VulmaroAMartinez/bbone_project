import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetMaterialRequestsDocument } from '@/lib/graphql/generated/graphql';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import { Search, Plus, Package, Calendar, User, Cog, X } from 'lucide-react';

import {
    CATEGORY_LABELS,
    IMPORTANCE_COLORS,
    IMPORTANCE_LABELS,
    PRIORITY_COLORS,
    PRIORITY_LABELS,
    formatDate,
} from './material-requests.constants';

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaterialRequestsPage() {
    const navigate = useNavigate();

    const { data, loading } = useQuery(GetMaterialRequestsDocument, {
        fetchPolicy: 'cache-and-network',
    });

    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const requests = useMemo(() => data?.materialRequestsWithDeleted ?? [], [data?.materialRequestsWithDeleted]);

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchSearch =
                !search ||
                r.folio.toLowerCase().includes(search.toLowerCase()) ||
                r.requester.fullName.toLowerCase().includes(search.toLowerCase()) ||
                (r.machines ?? []).some((mrm) =>
                    mrm.machine.name.toLowerCase().includes(search.toLowerCase())
                );
            const matchPriority = filterPriority === 'all' || r.priority === filterPriority;
            const matchCategory = filterCategory === 'all' || r.category === filterCategory;
            return matchSearch && matchPriority && matchCategory;
        });
    }, [requests, search, filterPriority, filterCategory]);

    const hasFilters = search || filterPriority !== 'all' || filterCategory !== 'all';

    const clearFilters = () => {
        setSearch('');
        setFilterPriority('all');
        setFilterCategory('all');
    };

    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Solicitudes de Material</h1>
                    <p className="text-sm text-muted-foreground">
                        {loading
                            ? 'Cargando...'
                            : `${filtered.length} solicitud${filtered.length !== 1 ? 'es' : ''}${hasFilters ? ' encontrada' + (filtered.length !== 1 ? 's' : '') : ''}`}
                    </p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => navigate('/solicitud-material/nueva')}
                >
                    <Plus className="h-4 w-4" />
                    Nueva
                </Button>
            </div>

            {/* Filtros */}
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Buscar por folio, solicitante o máquina..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="flex-1 min-w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las prioridades</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                            <SelectItem value="SCHEDULED">Programada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="flex-1 min-w-[150px] h-8 text-xs">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 text-xs text-muted-foreground"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* Lista */}
            {loading && requests.length === 0 ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Package className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin solicitudes</EmptyTitle>
                        <EmptyDescription>
                            {hasFilters
                                ? 'No hay solicitudes que coincidan con los filtros.'
                                : 'Crea la primera solicitud de material.'}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="space-y-3">
                    {filtered.map((req) => {
                        const machineEntities = (req.machines ?? []).map((mrm) => mrm.machine);
                        const areaNames = new Set(
                            machineEntities.map((m) => m.area?.name ?? m.subArea?.area?.name).filter(Boolean)
                        );
                        const areaName =
                            areaNames.size === 1 ? [...areaNames][0] : areaNames.size > 1 ? 'Diversas áreas' : undefined;
                        const firstMachine = machineEntities[0];
                        const extraCount = machineEntities.length - 1;
                        return (
                            <Card
                                key={req.id}
                                className={`cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] ${!req.isActive ? 'opacity-60' : ''}`}
                                onClick={() => navigate(`/solicitud-material/${req.id}`)}
                            >
                                <CardContent className="py-4">
                                    {/* Folio + badges */}
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className='flex-1 min-w-0'>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-mono font-semibold text-sm text-primary tracking-wide">
                                                    {req.folio}
                                                </span>
                                                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[req.priority] ?? ''}`}>
                                                    {PRIORITY_LABELS[req.priority] ?? req.priority}
                                                </span>
                                                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${IMPORTANCE_COLORS[req.importance] ?? ''}`}>
                                                    {IMPORTANCE_LABELS[req.importance] ?? req.importance}
                                                </span>
                                                {/* Categoría */}
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {CATEGORY_LABELS[req.category] ?? req.category}
                                                </Badge>
                                            </div>
                                            {/* Items count */}
                                            {req.items.length > 0 && (
                                                <p className="mt-2 text-base text-foreground line-clamp-2">
                                                    {req.items.length} artículo{req.items.length !== 1 ? 's' : ''} solicitado{req.items.length !== 1 ? 's' : ''}
                                                </p>
                                            )}

                                            {/* Metadata */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2 text-muted-foreground pt-1.5 border-t border-border/40">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3 shrink-0" />
                                                    {req.requester.fullName}
                                                </span>
                                                {firstMachine && (
                                                    <span className="flex items-center gap-1">
                                                        <Cog className="h-3 w-3 shrink-0" />
                                                        {firstMachine.name}
                                                        {extraCount > 0 && (
                                                            <span className="text-xs text-muted-foreground/70">(+{extraCount})</span>
                                                        )}
                                                    </span>
                                                )}
                                                {areaName && (
                                                    <span className="text-muted-foreground/80">{areaName as string}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                    {formatDate(req.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}