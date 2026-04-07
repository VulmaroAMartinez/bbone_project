import { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    MachineBasicFragmentDoc,
    GetMachinesPageDataDocument,
    DeactivateMachineDocument,
    ActivateMachineDocument,
} from '@/lib/graphql/generated/graphql';
import type { MachineBasicFragment } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/hooks/useAuth';

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
import { Combobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    PowerOff,
    Power,
    MoreVertical,
    Cog,
    Info,
    ClipboardList,
    Package,
    Wrench,
    ArrowUpDown,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { MachineFormModal } from './modals/MachineFormModal';

const getMachineLocationText = (machine: MachineBasicFragment) => {
    if (machine.area) {
        return `${machine.area?.name}`;
    } else if (machine.subArea) {
        return `${machine.subArea?.area?.name} → ${machine.subArea?.name}`;
    }
    return 'Sin ubicación';
}; 

// ─── Componente principal ───────────────────────────────────

export default function MachinesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin =
        user?.roles?.some((r) => r.name === 'ADMIN') ?? user?.role?.name === 'ADMIN';

    // ─── Data fetching
    const { data, loading, refetch } = useOfflineAwareQuery(GetMachinesPageDataDocument);

    // ─── Mutations
    const [deactivateMachine] = useMutation(DeactivateMachineDocument);
    const [activateMachine] = useMutation(ActivateMachineDocument);

    // ─── State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAreaId, setFilterAreaId] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<MachineBasicFragment | null>(null);
    const [viewingMachine, setViewingMachine] = useState<MachineBasicFragment | null>(null);
    const [deactivatingMachine, setDeactivatingMachine] = useState<MachineBasicFragment | null>(null);

    // ─── Datos derivados
    const machines = unmaskFragment(MachineBasicFragmentDoc, data?.machinesWithDeleted ?? []);
    const areas = data?.areasActive ?? [];

    const filteredMachines = useMemo(() => {
        let result = [...machines];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (m) =>
                    m.name.toLowerCase().includes(term) ||
                    m.code.toLowerCase().includes(term) ||
                    m.brand?.toLowerCase().includes(term) ||
                    m.model?.toLowerCase().includes(term),
            );
        }
        if (filterAreaId !== 'all') {
            result = result.filter((m) => {
                const machineAreaId = m.areaId ?? m.subArea?.area?.id;
                return machineAreaId === filterAreaId;
            });
        }
        if (filterStatus === 'active') result = result.filter((m) => m.isActive);
        if (filterStatus === 'inactive') result = result.filter((m) => !m.isActive);
        return result;
    }, [machines, searchTerm, filterAreaId, filterStatus]);

    const hasActiveFilters = searchTerm || filterAreaId !== 'all' || filterStatus !== 'all';
    const PAGE_SIZE = 12;
    const totalPages = Math.ceil(filteredMachines.length / PAGE_SIZE);
    const pageMachines = filteredMachines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ─── Handlers

    const openCreateForm = () => {
        setEditingMachine(null);
        setIsFormOpen(true);
    };

    const openEditForm = (machine: MachineBasicFragment) => {
        setEditingMachine(machine);
        setIsFormOpen(true);
    };

    const openInfo = (machine: MachineBasicFragment) => {
        setViewingMachine(machine);
        setIsInfoOpen(true);
    };

    const handleToggleStatus = async (machine: MachineBasicFragment) => {
        if (machine.isActive) {
            setDeactivatingMachine(machine);
            return;
        }
        try {
            await activateMachine({ variables: { id: machine.id } });
            toast.success(`"${machine.name}" activada`);
            refetch();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al activar');
        }
    };

    const confirmDeactivate = async () => {
        if (!deactivatingMachine) return;
        try {
            await deactivateMachine({ variables: { id: deactivatingMachine.id } });
            toast.success(`"${deactivatingMachine.name}" desactivada`);
            setDeactivatingMachine(null);
            refetch();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al desactivar');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterAreaId('all');
        setFilterStatus('all');
        setPage(1);
    };

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Equipos/Estructuras</h1>
                    <p className="text-sm text-muted-foreground">
                        {machines.length} equipo{machines.length !== 1 ? 's' : ''} registrado
                        {machines.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={openCreateForm} className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Nuevo Equipo
                    </Button>
                )}
            </div>

            {/* Buscador + Filtros */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, código, marca..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Combobox
                        options={[{ value: 'all', label: 'Todas las áreas' }, ...areas.map((a) => ({ value: a.id, label: a.name }))]}
                        value={filterAreaId}
                        onValueChange={(v) => { setFilterAreaId(v); setPage(1); }}
                        placeholder="Área"
                        searchPlaceholder="Buscar área..."
                        emptyText="Sin áreas"
                        triggerClassName="w-full sm:w-[180px]"
                    />

                    <Select
                        value={filterStatus}
                        onValueChange={(v) => { setFilterStatus(v as 'all' | 'active' | 'inactive'); setPage(1); }}
                    >
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activos</SelectItem>
                            <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* Listado de Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="bg-card">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-14" />
                                </div>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredMachines.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Cog className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>
                            {hasActiveFilters ? 'Sin resultados' : 'Sin equipos'}
                        </EmptyTitle>
                        <EmptyDescription>
                            {hasActiveFilters
                                ? 'Intenta ajustar los filtros de búsqueda.'
                                : 'Aún no se ha registrado ningún equipo.'}
                        </EmptyDescription>
                    </EmptyHeader>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </Empty>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {pageMachines.map((machine) => (
                            <MachineCard
                                key={machine.id}
                                machine={machine}
                                isAdmin={isAdmin}
                                onEdit={() => openEditForm(machine)}
                                onToggle={() => handleToggleStatus(machine)}
                                onViewInfo={() => openInfo(machine)}
                                onNavigate={(path) => navigate(path)}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* ─── Modal: Crear / Editar ──────────────────────────── */}
            <MachineFormModal
                open={isFormOpen}
                onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingMachine(null); }}
                machine={editingMachine}
                areas={areas}
                onSuccess={() => refetch()}
            />

            {/* ─── Modal: Ver información ────────────────────────── */}
            <MachineInfoModal
                machine={viewingMachine}
                open={isInfoOpen}
                onOpenChange={setIsInfoOpen}
            />

            {/* ─── Confirmación: Desactivar ──────────────────────── */}
            <AlertDialog
                open={!!deactivatingMachine}
                onOpenChange={(open) => !open && setDeactivatingMachine(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar equipo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El equipo <strong>{deactivatingMachine?.name}</strong> (
                            {deactivatingMachine?.code}) será marcada como inactiva. Podrás
                            reactivarla más tarde.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeactivate}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Desactivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ─── Componente: Card de máquina ────────────────────────────

interface MachineCardProps {
    machine: MachineBasicFragment;
    isAdmin: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onViewInfo: () => void;
    onNavigate: (path: string) => void;
}

function MachineCard({
    machine,
    isAdmin,
    onEdit,
    onToggle,
    onViewInfo,
    onNavigate,
}: MachineCardProps) {
    return (
        <Card
            className={`bg-card transition-all hover:shadow-md ${!machine.isActive ? 'opacity-60' : ''}`}
        >
            <CardContent className="p-4 space-y-3">
                {/* Fila: Código + Estado + Menú */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                            {machine.code}
                        </Badge>
                        <span
                            className={`h-2 w-2 rounded-full shrink-0 ${machine.isActive ? 'bg-green-500' : 'bg-red-400'}`}
                            title={machine.isActive ? 'Activa' : 'Inactiva'}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem onClick={() => onNavigate(`/maquinas/${machine.id}/ordenes`)}>
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Órdenes relacionadas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigate(`/maquinas/${machine.id}/solicitudes`)}>
                                <Package className="h-4 w-4 mr-2" />
                                Solicitudes de material
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigate(`/maquinas/${machine.id}/refacciones`)}>
                                <Wrench className="h-4 w-4 mr-2" />
                                Refacciones
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onViewInfo}>
                                <Info className="h-4 w-4 mr-2" />
                                Ver información
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Nombre */}
                <div>
                    <h3 className="font-semibold text-foreground leading-tight truncate">
                        {machine.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {getMachineLocationText(machine)}
                    </p>
                </div>

                {/* Detalles (marca / modelo) */}
                {(machine.brand || machine.model) && (
                    <div className="flex flex-wrap gap-1.5">
                        {machine.brand && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                                {machine.brand}
                            </span>
                        )}
                        {machine.model && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                                {machine.model}
                            </span>
                        )}
                    </div>
                )}

                {/* Acciones directas */}
                {isAdmin && (
                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-xs h-8">
                            <Edit2 className="h-3.5 w-3.5" /> Editar
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className={`gap-1.5 text-xs h-8 ml-auto ${machine.isActive ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}`}
                        >
                            {machine.isActive ? (
                                <>
                                    <PowerOff className="h-3.5 w-3.5" /> Desactivar
                                </>
                            ) : (
                                <>
                                    <Power className="h-3.5 w-3.5" /> Activar
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Componente: Modal de información ───────────────────────

interface MachineInfoModalProps {
    machine: MachineBasicFragment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function MachineInfoModal({ machine, open, onOpenChange }: MachineInfoModalProps) {
    if (!machine) return null;

    const details = [
        { label: 'Código', value: machine.code },
        { label: 'Nombre', value: machine.name },
        { label: 'Descripción', value: machine.description || '—' },
        { label: 'Ubicación', value: getMachineLocationText(machine) },
        { label: 'Marca', value: machine.brand || '—' },
        { label: 'Modelo', value: machine.model || '—' },
        { label: 'Número de serie', value: machine.serialNumber || '—' },
        {
            label: 'Fecha de instalación',
            value: machine.installationDate
                ? new Date(machine.installationDate).toLocaleDateString('es-MX', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : '—',
        },
        { label: 'Estado', value: machine.isActive ? 'Activa' : 'Inactiva' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cog className="h-5 w-5 text-primary" />
                        {machine.name}
                    </DialogTitle>
                    <DialogDescription>
                        Información completa de la máquina {machine.code}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {details.map((d, i) => (
                        <div key={i} className="flex justify-between items-start gap-4">
                            <span className="text-sm text-muted-foreground shrink-0">{d.label}</span>
                            <span className="text-sm font-medium text-foreground text-right">{d.value}</span>
                        </div>
                    ))}

                    {/* Foto + documentación */}
                    {machine.machinePhotoUrl && (
                        <div className="pt-3 border-t border-border space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                Foto
                            </p>
                            <img
                                src={machine.machinePhotoUrl}
                                alt={`Foto de ${machine.name}`}
                                className="w-full h-48 object-cover rounded-lg border border-border"
                            />
                        </div>
                    )}
                    {machine.operationalManualUrl && (
                        <div className="pt-3 border-t border-border space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                Documentación
                            </p>
                            <a
                                href={machine.operationalManualUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary underline underline-offset-2 block truncate"
                            >
                                Ver manual operativo
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}