import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { List } from 'react-window';

import {
    GetAreasWithDeletedDocument,
    GetSubAreasByAreaDocument,
    CreateAreaDocument,
    UpdateAreaDocument,
    DeactivateAreaDocument,
    ActivateAreaDocument,
    UpdateSubAreaDocument,
    DeactivateSubAreaDocument,
    type AreaType,
    type AreaDetailFragment,
    AreaDetailFragmentDoc,
    SubAreaBasicFragmentDoc,
    CreateSubAreaDocument,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Schema de validación ────────────────────────────────────────────────────
const AREA_TYPES_WITH_SUBAREAS = ['OPERATIONAL', 'PRODUCTION'];

const areaSchema = yup.object({
    name: yup.string().trim().max(100).required('El nombre es obligatorio'),
    type: yup
        .mixed<AreaType>()
        .oneOf(['OPERATIONAL', 'SERVICE', 'PRODUCTION'])
        .required('El tipo es obligatorio'),
    description: yup.string().trim().max(255).default(''),
});

type AreaFormValues = yup.InferType<typeof areaSchema>;

const EMPTY_FORM: AreaFormValues = { name: '', type: 'OPERATIONAL', description: '' };

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

const VIRTUAL_LIST_THRESHOLD = 30;
const ROW_HEIGHT = 44;

type SubAreaItem = { id: string; name: string; isActive: boolean };

// ─── Lista editable de sub-áreas (virtualizada para 100+) ─────────────────────
function SubAreasEditableList({
    items,
    editingId,
    editingName,
    onEditingNameChange,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDeactivate,
}: {
    items: SubAreaItem[];
    editingId: string | null;
    editingName: string;
    onEditingNameChange: (v: string) => void;
    onStartEdit: (id: string, name: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDeactivate: (id: string) => void;
}) {
    const useVirtualList = items.length >= VIRTUAL_LIST_THRESHOLD;
    const maxHeight = Math.min(items.length * ROW_HEIGHT, 280);

    const RowComponent = useCallback(
        ({ index, style, ...rowProps }: { index: number; style: React.CSSProperties } & Record<string, unknown>) => {
            const sa = items[index];
            const isEditing = editingId === sa.id;
            const { onStartEdit: onStart, onSaveEdit: onSave, onCancelEdit: onCancel, onDeactivate: onDeact, onEditingNameChange: onNameChange } = rowProps as {
                onStartEdit: (id: string, name: string) => void;
                onSaveEdit: () => void;
                onCancelEdit: () => void;
                onDeactivate: (id: string) => void;
                onEditingNameChange: (v: string) => void;
            };
            return (
                <div style={style} className="flex items-center gap-2 px-2 py-1.5 border-b border-border/30 last:border-0">
                    {isEditing ? (
                        <>
                            <Input
                                value={editingName}
                                onChange={(e) => onNameChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSave();
                                    if (e.key === 'Escape') onCancel();
                                }}
                                className="h-8 text-sm flex-1"
                                autoFocus
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={onSave} className="h-7 px-2">
                                Guardar
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2">
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="flex-1 truncate text-sm">{sa.name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onStart(sa.id, sa.name)}
                            >
                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => onDeact(sa.id)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                </div>
            );
        },
        [items, editingId, editingName, onStartEdit, onSaveEdit, onCancelEdit, onDeactivate, onEditingNameChange]
    );

    if (items.length === 0) return null;

    if (useVirtualList) {
        return (
            <div className="rounded-md border border-border/50 overflow-hidden" style={{ height: maxHeight }}>
                <List
                    rowComponent={RowComponent}
                    rowProps={{
                        onStartEdit,
                        onSaveEdit,
                        onCancelEdit,
                        onDeactivate,
                        onEditingNameChange,
                    }}
                    rowCount={items.length}
                    rowHeight={ROW_HEIGHT}
                    style={{ height: maxHeight, width: '100%' }}
                    overscanCount={5}
                />
            </div>
        );
    }

    return (
        <ScrollArea className="rounded-md border border-border/50" style={{ maxHeight }}>
            <div className="p-1">
                {items.map((sa) => {
                    const isEditing = editingId === sa.id;
                    return (
                        <div
                            key={sa.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/30"
                        >
                            {isEditing ? (
                                <>
                                    <Input
                                        value={editingName}
                                        onChange={(e) => onEditingNameChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSaveEdit();
                                            if (e.key === 'Escape') onCancelEdit();
                                        }}
                                        className="h-8 text-sm flex-1"
                                        autoFocus
                                    />
                                    <Button type="button" variant="ghost" size="sm" onClick={onSaveEdit} className="h-7 px-2">
                                        Guardar
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 px-2">
                                        Cancelar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 truncate text-sm">{sa.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onStartEdit(sa.id, sa.name)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => onDeactivate(sa.id)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AreasPage() {
    const navigate = useNavigate();

    // ─── Queries / Mutations
    const { data, loading, refetch } = useQuery(GetAreasWithDeletedDocument, {
        fetchPolicy: 'cache-and-network',
    });

    const [createArea] = useMutation(CreateAreaDocument);
    const [updateArea] = useMutation(UpdateAreaDocument);
    const [deactivateArea] = useMutation(DeactivateAreaDocument);
    const [activateArea] = useMutation(ActivateAreaDocument);

    const [newSubAreas, setNewSubAreas] = useState<string[]>([]);
    const [subAreaInput, setSubAreaInput] = useState('');
    const [subAreaError, setSubAreaError] = useState('');

    const [createSubArea] = useMutation(CreateSubAreaDocument);
    const [updateSubArea] = useMutation(UpdateSubAreaDocument);
    const [deactivateSubArea] = useMutation(DeactivateSubAreaDocument);

    const [existingSubAreas, setExistingSubAreas] = useState<
        Array<{ id: string; name: string; isActive: boolean }>
    >([]);
    const [editingSubAreaId, setEditingSubAreaId] = useState<string | null>(null);
    const [editingSubAreaName, setEditingSubAreaName] = useState('');

    // ─── State
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<AreaType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaDetailFragment | null>(null);
    const [viewingArea, setViewingArea] = useState<AreaDetailFragment | null>(null);
    const [deactivatingArea, setDeactivatingArea] = useState<AreaDetailFragment | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ─── Form
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm<AreaFormValues>({
        resolver: yupResolver(areaSchema),
        defaultValues: EMPTY_FORM,
    });

    const formType = watch('type');

    // Sub-áreas para modal info y modal editar
    const subAreasAreaId = (isFormOpen && editingArea) ? editingArea.id : (isInfoOpen && viewingArea) ? viewingArea.id : '';
    const { data: subAreasData, loading: subAreasLoading } = useQuery(GetSubAreasByAreaDocument, {
        variables: { areaId: subAreasAreaId },
        skip: !subAreasAreaId,
        fetchPolicy: 'cache-and-network',
    });

    const areaType = (editingArea?.type ?? formType) as AreaType;

    useEffect(() => {
        if (!AREA_TYPES_WITH_SUBAREAS.includes(areaType as AreaType)) {
            setNewSubAreas([]);
            setSubAreaInput('');
            setSubAreaError('');
            if (!editingArea) setExistingSubAreas([]);
        }
    }, [areaType, isFormOpen, editingArea]);

    useEffect(() => {
        if (subAreasData?.subAreasByArea && (editingArea || viewingArea)) {
            const subs = unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea);
            setExistingSubAreas(
                subs.map(s => ({ id: s.id, name: s.name, isActive: s.isActive }))
            );
        } else if (!subAreasAreaId) {
            setExistingSubAreas([]);
        }
    }, [subAreasData, editingArea, viewingArea, subAreasAreaId]);

    // ─── Derived data
    const areas = data?.areasWithDeleted ? unmaskFragment(AreaDetailFragmentDoc, data.areasWithDeleted) : [];

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
        reset(EMPTY_FORM);
        setNewSubAreas([]);
        setSubAreaInput('');
        setSubAreaError('');
        setExistingSubAreas([]);
        setIsFormOpen(true);
    };

    const openEdit = (area: AreaDetailFragment) => {
        setEditingArea(area);
        reset({
            name: area.name,
            type: area.type as AreaType,
            description: area.description ?? '',
        });
        setNewSubAreas([]);
        setSubAreaInput('');
        setSubAreaError('');
        setExistingSubAreas([]);
        setEditingSubAreaId(null);
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

    const onSubmit = async (values: AreaFormValues) => {
        setIsSaving(true);
        try {
            let areaId: string;
            if (editingArea) {
                await updateArea({
                    variables: {
                        id: editingArea.id,
                        input: {
                            name: values.name,
                            type: values.type,
                            description: values.description || undefined,
                        },
                    },
                });
                areaId = editingArea.id;
            } else {
                const { data: createData } = await createArea({
                    variables: {
                        input: {
                            name: values.name,
                            type: values.type,
                            description: values.description || undefined,
                        },
                    },
                });

                const createdArea = createData?.createArea
                    ? unmaskFragment(AreaDetailFragmentDoc, createData.createArea)
                    : null;

                if (!createdArea) throw new Error("Error al crear el área");
                areaId = createdArea.id;
            }

            if (newSubAreas.length > 0) {
                const subAreaPromises = newSubAreas.map(name =>
                    createSubArea({
                        variables: {
                            input: { areaId, name },
                        },
                    })
                );
                await Promise.all(subAreaPromises);
                toast.success('Sub-áreas creadas correctamente');
            }

            await refetch();
            setIsFormOpen(false);
            reset(EMPTY_FORM);
            setNewSubAreas([]);
            setExistingSubAreas([]);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar el área');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSubArea = async () => {
        const trimmed = subAreaInput.trim();
        if (!trimmed) return;

        if (trimmed.length > 100) {
            setSubAreaError('Máximo 100 caracteres');
            return;
        }

        const allNames = [
            ...newSubAreas.map((s) => s.toLowerCase()),
            ...existingSubAreas.map((s) => s.name.toLowerCase()),
        ];

        if (allNames.includes(trimmed.toLowerCase())) {
            setSubAreaError('Esta sub-área ya existe');
            return;
        }

        setNewSubAreas(prev => [...prev, trimmed]);
        setSubAreaInput('');
        setSubAreaError('');
    };

    const handleRemoveSubArea = (index: number) => {
        setNewSubAreas(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartEditSubArea = (id: string, name: string) => {
        setEditingSubAreaId(id);
        setEditingSubAreaName(name);
    };

    const handleSaveEditSubArea = useCallback(async () => {
        if (!editingSubAreaId || !editingSubAreaName.trim()) {
            setEditingSubAreaId(null);
            return;
        }
        const trimmed = editingSubAreaName.trim();
        if (trimmed.length > 100) {
            toast.error('Máximo 100 caracteres');
            return;
        }
        try {
            await updateSubArea({
                variables: {
                    id: editingSubAreaId,
                    input: { name: trimmed },
                },
            });
            setExistingSubAreas(prev =>
                prev.map(s => (s.id === editingSubAreaId ? { ...s, name: trimmed } : s))
            );
            setEditingSubAreaId(null);
            setEditingSubAreaName('');
            toast.success('Sub-área actualizada');
        } catch (error: unknown) {
            toast.error((error as Error)?.message || 'Error al actualizar');
        }
    }, [editingSubAreaId, editingSubAreaName, updateSubArea]);

    const handleCancelEditSubArea = () => {
        setEditingSubAreaId(null);
        setEditingSubAreaName('');
    };

    const handleDeactivateSubArea = useCallback(async (id: string) => {
        try {
            await deactivateSubArea({ variables: { id } });
            setExistingSubAreas(prev => prev.filter(s => s.id !== id));
            if (editingSubAreaId === id) setEditingSubAreaId(null);
            toast.success('Sub-área desactivada');
        } catch (error: unknown) {
            toast.error((error as Error)?.message || 'Error al desactivar');
        }
    }, [deactivateSubArea, editingSubAreaId]);

    const handleSubAreaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSubArea();
        }
    }

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
    };

    const hasFilters = search || filterType !== 'all' || filterStatus !== 'all';
    const subAreas = subAreasData?.subAreasByArea
        ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
        : [];

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
                        onChange={(e) => setSearch(e.target.value)}
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
                        onValueChange={(v) => setFilterType(v as AreaType | 'all')}
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
                        onValueChange={(v) => setFilterStatus(v as 'all' | 'active' | 'inactive')}
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
                                    {filtered.map((area) => (
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
                    </CardContent>
                </Card>
            )}

            {/* ── Modal Crear / Editar ─────────────────────────────────────── */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                        <DialogTitle>
                            {editingArea ? 'Editar área' : 'Nueva área'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">
                                Nombre <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej. Área de Producción A"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Tipo */}
                        <div className="space-y-1.5">
                            <Label>
                                Tipo <span className="text-destructive">*</span>
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPERATIONAL">
                                                Operativa
                                            </SelectItem>
                                            <SelectItem value="SERVICE">
                                                Servicio
                                            </SelectItem>
                                            <SelectItem value="PRODUCTION">
                                                Producción
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && (
                                <p className="text-xs text-destructive">{errors.type.message}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                placeholder="Descripción opcional..."
                                {...register('description')}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* ── Sub-áreas: agregar en crear, editar en editar ───────────── */}
                        {AREA_TYPES_WITH_SUBAREAS.includes(areaType) && (
                            <div className="space-y-2">
                                <Label>
                                    Sub-áreas{' '}
                                    <span className="text-muted-foreground font-normal">(opcional)</span>
                                </Label>

                                {/* CREAR: solo input para agregar sub-áreas nuevas */}
                                {!editingArea && (
                                    <>
                                        {newSubAreas.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {newSubAreas.map((name, idx) => (
                                                    <Badge
                                                        key={`new-${idx}`}
                                                        variant="outline"
                                                        className="text-xs py-1 px-2 gap-1 bg-primary/5"
                                                    >
                                                        {name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSubArea(idx)}
                                                            className="ml-0.5 hover:text-destructive transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nombre de sub-área..."
                                                value={subAreaInput}
                                                onChange={(e) => {
                                                    setSubAreaInput(e.target.value);
                                                    setSubAreaError('');
                                                }}
                                                onKeyDown={handleSubAreaKeyDown}
                                                className="flex-1 h-8 text-sm"
                                                maxLength={100}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddSubArea}
                                                disabled={!subAreaInput.trim()}
                                                className="shrink-0 h-8"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        {subAreaError && (
                                            <p className="text-xs text-destructive">{subAreaError}</p>
                                        )}
                                        {newSubAreas.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {newSubAreas.length} sub-área{newSubAreas.length !== 1 ? 's' : ''} a crear
                                            </p>
                                        )}
                                    </>
                                )}

                                {/* EDITAR: lista editable de existentes + input para agregar */}
                                {editingArea && (
                                    <>
                                        {subAreasLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-8 w-3/4" />
                                            </div>
                                        ) : (
                                            <>
                                                {existingSubAreas.filter(s => s.isActive).length > 0 && (
                                                    <SubAreasEditableList
                                                        items={existingSubAreas.filter(s => s.isActive)}
                                                        editingId={editingSubAreaId}
                                                        editingName={editingSubAreaName}
                                                        onEditingNameChange={setEditingSubAreaName}
                                                        onStartEdit={handleStartEditSubArea}
                                                        onSaveEdit={handleSaveEditSubArea}
                                                        onCancelEdit={handleCancelEditSubArea}
                                                        onDeactivate={handleDeactivateSubArea}
                                                    />
                                                )}
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Agregar sub-área..."
                                                        value={subAreaInput}
                                                        onChange={(e) => {
                                                            setSubAreaInput(e.target.value);
                                                            setSubAreaError('');
                                                        }}
                                                        onKeyDown={handleSubAreaKeyDown}
                                                        className="flex-1 h-8 text-sm"
                                                        maxLength={100}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAddSubArea}
                                                        disabled={!subAreaInput.trim()}
                                                        className="shrink-0 h-8"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                {subAreaError && (
                                                    <p className="text-xs text-destructive">{subAreaError}</p>
                                                )}
                                                {(existingSubAreas.filter(s => s.isActive).length + newSubAreas.length) > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {existingSubAreas.filter(s => s.isActive).length + newSubAreas.length} sub-área
                                                        {(existingSubAreas.filter(s => s.isActive).length + newSubAreas.length) !== 1 ? 's' : ''}
                                                        {newSubAreas.length > 0 && (
                                                            <span className="text-primary">
                                                                {' '}({newSubAreas.length} nueva{newSubAreas.length !== 1 ? 's' : ''})
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        {newSubAreas.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {newSubAreas.map((name, idx) => (
                                                    <Badge
                                                        key={`new-${idx}`}
                                                        variant="outline"
                                                        className="text-xs py-1 px-2 gap-1 bg-primary/5"
                                                    >
                                                        {name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSubArea(idx)}
                                                            className="ml-0.5 hover:text-destructive transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingArea ? 'Guardar cambios' : 'Crear área'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Modal Info del Área ──────────────────────────────────────── */}
            <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {viewingArea?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {viewingArea && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs mb-0.5">Tipo</p>
                                    <span
                                        className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${AREA_TYPE_COLORS[viewingArea.type as AreaType]}`}
                                    >
                                        {AREA_TYPE_LABELS[viewingArea.type as AreaType]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs mb-0.5">Estado</p>
                                    <Badge
                                        variant={viewingArea.isActive ? 'default' : 'outline'}
                                        className="text-xs"
                                    >
                                        {viewingArea.isActive ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>
                            </div>

                            {viewingArea.description && (
                                <div>
                                    <p className="text-muted-foreground text-xs mb-0.5">Descripción</p>
                                    <p className="text-sm text-foreground">{viewingArea.description}</p>
                                </div>
                            )}

                            {/* Sub-áreas */}
                            <div>
                                <p className="text-muted-foreground text-xs mb-2">Sub-áreas</p>
                                {subAreasLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-3/4" />
                                    </div>
                                ) : subAreas.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        Sin sub-áreas registradas
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {subAreas.map((sa) => (
                                            <div
                                                key={sa.id}
                                                className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 text-sm"
                                            >
                                                <span className="font-medium">{sa.name}</span>
                                                {!sa.isActive && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        Inactiva
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                                Creada el{' '}
                                {new Date(viewingArea.createdAt).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Confirm Desactivar ───────────────────────────────────────── */}
            <AlertDialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar área?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El área <strong>{deactivatingArea?.name}</strong> quedará inactiva.
                            Podrás reactivarla en cualquier momento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeactivate}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Desactivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}