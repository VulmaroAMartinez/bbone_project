import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetAreasWithDeletedDocument,
    DeactivateAreaDocument,
    ActivateAreaDocument,
    type AreaType,
    type AreaDetailFragment,
    AreaDetailFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import {
    Search,
    Plus,
    Edit2,
    Power,
    PowerOff,
    MoreVertical,
    Loader2,
    MapPin,
    ClipboardList,
    Cog,
    AlertTriangle,
    Info,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { AreaFormModal } from './modals/AreaFormModal';
import { AreaInfoModal } from './modals/AreaInfoModal';
import { AreaDeactivateDialog } from './modals/AreaDeactivateDialog';

// ─── Constants ───────────────────────────────────────────
const AREA_TYPE_LABELS: Record<AreaType, string> = {
    'OPERATIONAL': 'Operativa',
    'SERVICE': 'Servicio',
    'PRODUCTION': 'Producción',
};

const AREA_TYPE_COLORS: Record<AreaType, string> = {
    'OPERATIONAL': 'bg-blue-100 text-blue-700',
    'SERVICE': 'bg-purple-100 text-purple-700',
    'PRODUCTION': 'bg-orange-100 text-orange-700',
};

// ─── Component ───────────────────────────────────────────
export default function AreasPage() {
    const navigate = useNavigate();

    // ─── Queries / Mutations
    const { data, loading, refetch } = useQuery(GetAreasWithDeletedDocument, {
        fetchPolicy: 'cache-and-network',
    });

    const [deactivateArea] = useMutation(DeactivateAreaDocument);
    const [activateArea] = useMutation(ActivateAreaDocument);

    // ─── State
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<AreaType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaDetailFragment | null>(null);
    const [viewingArea, setViewingArea] = useState<AreaDetailFragment | null>(null);
    const [deactivatingArea, setDeactivatingArea] = useState<AreaDetailFragment | null>(null);

    // ─── Derived data
    const areas = useMemo(() => data?.areasWithDeleted ? unmaskFragment(AreaDetailFragmentDoc, data.areasWithDeleted) : [], [data?.areasWithDeleted]);

    const filtered = useMemo(() => {
        return areas.filter((a) => {
            const matchSearch =
                !search ||
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                (a.description ?? '').toLowerCase().includes(search.toLowerCase());
            const matchType = filterType === 'all' || a.type === filterType;
            const matchStatus =
                filterStatus === 'all'
                    ? true
                    : filterStatus === 'active'
                        ? a.isActive
                        : !a.isActive;
            return matchSearch && matchType && matchStatus;
        });
    }, [areas, search, filterType, filterStatus]);

    // ─── Handlers
    const openCreate = () => {
        setEditingArea(null);
        setIsFormOpen(true);
    };

    const openEdit = (area: AreaDetailFragment) => {
        setEditingArea(area);
        setIsFormOpen(true);
    };

    const openInfo = (area: AreaDetailFragment) => {
        setViewingArea(area);
        setIsInfoOpen(true);
    };

    const openDeactivate = (area: AreaDetailFragment) => {
        setDeactivatingArea(area);
        setIsDeactivateOpen(true);
    };

    const handleToggleStatus = async (area: AreaDetailFragment) => {
        if (area.isActive) {
            openDeactivate(area);
        } else {
            await activateArea({ variables: { id: area.id } });
            await refetch();
        }
    };

    const confirmDeactivate = async () => {
        if (!deactivatingArea) return;
        await deactivateArea({ variables: { id: deactivatingArea.id } });
        await refetch();
        setIsDeactivateOpen(false);
        setDeactivatingArea(null);
    };

    const clearFilters = () => {
        setSearch('');
        setFilterType('all');
        setFilterStatus('all');
        setPage(1);
    };

    const PAGE_SIZE = 20;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageAreas = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = search || filterType !== 'all' || filterStatus !== 'all';

    // ─── Render
    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Áreas</h1>
                    <p className="text-sm text-muted-foreground">
                        {filtered.length} área{filtered.length !== 1 ? 's' : ''}
                        {hasFilters && ' encontrada' + (filtered.length !== 1 ? 's' : '')}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
                    <Plus className="h-4 w-4" />
                    Nueva área
                </Button>
            </div>

            {/* Buscador y Filtros */}
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o descripción..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 pr-9"
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

                <div className="flex gap-2">
                    <Select
                        value={filterType}
                        onValueChange={(v) => { setFilterType(v as AreaType | 'all'); setPage(1); }}
                    >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="OPERATIONAL">Operativa</SelectItem>
                            <SelectItem value="SERVICE">Servicio</SelectItem>
                            <SelectItem value="PRODUCTION">Producción</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filterStatus}
                        onValueChange={(v) => { setFilterStatus(v as 'all' | 'active' | 'inactive'); setPage(1); }}
                    >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activas</SelectItem>
                            <SelectItem value="inactive">Inactivas</SelectItem>
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
            {loading && !data ? (
                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-0">
                        <div className="py-10 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </div>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MapPin className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin áreas</EmptyTitle>
                        <EmptyDescription>
                            {hasFilters
                                ? 'No hay áreas que coincidan con los filtros.'
                                : 'Agrega la primera área para comenzar.'}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Card className="bg-card shadow-sm border-border">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Área</th>
                                        <th className="px-4 py-3 font-semibold hidden sm:table-cell">Tipo</th>
                                        <th className="px-4 py-3 font-semibold">Estado</th>
                                        <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {pageAreas.map((area) => (
                                        <tr key={area.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                                                    <span className="truncate">{area.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span
                                                    className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${AREA_TYPE_COLORS[area.type as AreaType]}`}
                                                >
                                                    {AREA_TYPE_LABELS[area.type as AreaType]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${area.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                                        {area.isActive ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(area)}
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(area)}
                                                        title={area.isActive ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {area.isActive ? (
                                                            <PowerOff className="h-4 w-4 text-destructive" />
                                                        ) : (
                                                            <Power className="h-4 w-4 text-success" />
                                                        )}
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" title="Más opciones">
                                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => navigate(`/areas/${area.id}/ordenes`)}>
                                                                <ClipboardList className="h-4 w-4 mr-2" />
                                                                Órdenes relacionadas
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/areas/${area.id}/maquinas`)}>
                                                                <Cog className="h-4 w-4 mr-2" />
                                                                Máquinas relacionadas
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/areas/${area.id}/hallazgos`)}>
                                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                                Hallazgos relacionados
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openInfo(area)}>
                                                                <Info className="h-4 w-4 mr-2" />
                                                                Ver info del área
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft className="h-4 w-4" /> Anterior
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                        Siguiente <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <AreaFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                area={editingArea}
                onSuccess={() => refetch()}
            />

            <AreaInfoModal
                open={isInfoOpen}
                onOpenChange={setIsInfoOpen}
                area={viewingArea}
            />

            <AreaDeactivateDialog
                open={isDeactivateOpen}
                onOpenChange={setIsDeactivateOpen}
                area={deactivatingArea}
                onConfirm={confirmDeactivate}
            />
        </div>
    );
}
