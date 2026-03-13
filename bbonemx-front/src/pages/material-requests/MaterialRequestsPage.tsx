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

// ─── Constantes de labels/colores (exported para reusar en otras páginas) ────

export const CATEGORY_LABELS: Record<string, string> = {
    EQUIPMENT: 'Equipo',
    MATERIAL_WITH_SKU: 'Material con SKU',
    NON_INVENTORY_MATERIAL: 'Material no inventariado',
    NON_INVENTORY_SPARE_PART: 'Refacción no inventariada',
    PPE: 'Protección personal',
    REQUEST_SKU_MATERIAL: 'Solicitud SKU Material',
    REQUEST_SKU_SPARE_PART: 'Solicitud SKU Refacción',
    SERVICE: 'Servicio',
    SERVICE_WITH_MATERIAL: 'Servicio con material',
    SPARE_PART_WITH_SKU: 'Refacción con SKU',
    TOOLS: 'Herramientas',
    UPDATE_SKU: 'Actualización de SKU',
};

export const PRIORITY_LABELS: Record<string, string> = {
    URGENT: 'Urgente',
    SCHEDULED: 'Programada',
};

export const IMPORTANCE_LABELS: Record<string, string> = {
    VERY_IMPORTANT: 'Muy importante',
    IMPORTANT: 'Importante',
    UNIMPORTANT: 'Poco importante',
};

export const PRIORITY_COLORS: Record<string, string> = {
    URGENT: 'bg-red-100 text-red-700 border-red-200',
    SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const IMPORTANCE_COLORS: Record<string, string> = {
    VERY_IMPORTANT: 'bg-orange-100 text-orange-700 border-orange-200',
    IMPORTANT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    UNIMPORTANT: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaterialRequestsPage() {
    const navigate = useNavigate();

    const { data, loading } = useQuery(GetMaterialRequestsDocument, {
        fetchPolicy: 'cache-and-network',
    });

    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const requests = data?.materialRequestsWithDeleted ?? [];

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchSearch =
                !search ||
                r.folio.toLowerCase().includes(search.toLowerCase()) ||
                r.requester.fullName.toLowerCase().includes(search.toLowerCase()) ||
                r.machine.name.toLowerCase().includes(search.toLowerCase());
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
                        const areaName = req.machine.area?.name ?? req.machine.subArea?.name;
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
                                                <span className="flex items-center gap-1">
                                                    <Cog className="h-3 w-3 shrink-0" />
                                                    {req.machine.name}
                                                </span>
                                                {areaName && (
                                                    <span className="text-muted-foreground/80">{areaName}</span>
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