import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import {
    MachineBasicFragmentDoc,
    GetMachinesPageDataDocument,
    CreateMachineDocument,
    UpdateMachineDocument,
    DeactivateMachineDocument,
    ActivateMachineDocument,
    SubAreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import type { MachineBasicFragment } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/contexts/auth-context';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogFooter,
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
    Loader2,
    Cog,
    Info,
    ClipboardList,
    Package,
    Wrench,
    MapPin,
    ArrowUpDown,
    X,
    Upload,
    ImageIcon,
    Trash2,
} from 'lucide-react';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { useAreaMachineSelector } from '@/hooks/useAreaMachineSelector';

// ─── Schema de validación ───────────────────────────────────

const machineSchema = yup.object({
    code: yup.string().trim().required('El código es obligatorio'),
    name: yup.string().trim().required('El nombre es obligatorio'),
    areaId: yup.string().required('Seleccione un área'),
    subAreaId: yup.string().default(''), // ← YA NO ES REQUIRED
    description: yup.string().trim().default(''),
    brand: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    serialNumber: yup.string().trim().default(''),
    installationDate: yup.string().default(''),
    machinePhotoUrl: yup.string().trim().default(''),
    operationalManualUrl: yup.string().trim().url('URL no válida').default(''),
});


type MachineFormValues = yup.InferType<typeof machineSchema>;

const EMPTY_FORM: MachineFormValues = {
    code: '',
    name: '',
    areaId: '',
    subAreaId: '',
    description: '',
    brand: '',
    model: '',
    serialNumber: '',
    installationDate: '',
    machinePhotoUrl: '',
    operationalManualUrl: '',
};

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
    const { data, loading, refetch } = useQuery(GetMachinesPageDataDocument, {
        fetchPolicy: 'cache-and-network',
    });

    // ─── Mutations
    const [createMachine] = useMutation(CreateMachineDocument);
    const [updateMachine] = useMutation(UpdateMachineDocument);
    const [deactivateMachine] = useMutation(DeactivateMachineDocument);
    const [activateMachine] = useMutation(ActivateMachineDocument);

    // ─── State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAreaId, setFilterAreaId] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<MachineBasicFragment | null>(null);
    const [viewingMachine, setViewingMachine] = useState<MachineBasicFragment | null>(null);
    const [deactivatingMachine, setDeactivatingMachine] = useState<MachineBasicFragment | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        selectedAreaId,
        selectedSubAreaId: _hookSubAreaId, // no usamos este, react-hook-form lo maneja
        subAreasData,
        isLoadingSubAreas: subAreasLoading,
        hasSubAreas,
        subAreasLoaded,
        handleAreaChange: hookAreaChange,
        handleSubAreaChange: hookSubAreaChange,
        initWith: initSelector,
    } = useAreaMachineSelector();

    // ─── Form
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MachineFormValues>({
        resolver: yupResolver(machineSchema),
        defaultValues: EMPTY_FORM,
    });

    // ─── Datos derivados
    const machines = unmaskFragment(MachineBasicFragmentDoc, data?.machinesWithDeleted ?? []);
    const areas = data?.areasActive ?? [];

    const subAreas = subAreasData?.subAreasByArea
        ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
        : [];

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

    // ─── Handlers

    const openCreateForm = () => {
        initSelector('', '');
        setEditingMachine(null);
        reset(EMPTY_FORM);
        setPhotoPreview(null);
        setIsFormOpen(true);
    };

    const openEditForm = (machine: MachineBasicFragment) => {
        setEditingMachine(machine);
        // Obtener el área desde la relación directa o desde la sub-área
        const areaId = machine.areaId ?? machine.subArea?.area?.id ?? '';
        const subAreaId = machine.subAreaId ?? '';

        // Inicializar el hook con los valores de la máquina
        initSelector(areaId, subAreaId || undefined);

        reset({
            code: machine.code,
            name: machine.name,
            areaId,
            subAreaId,
            description: machine.description ?? '',
            brand: machine.brand ?? '',
            model: machine.model ?? '',
            serialNumber: machine.serialNumber ?? '',
            installationDate: machine.installationDate
                ? new Date(machine.installationDate).toISOString().split('T')[0]
                : '',
            machinePhotoUrl: machine.machinePhotoUrl ?? '',
            operationalManualUrl: machine.operationalManualUrl ?? '',
        });
        setPhotoPreview(machine.machinePhotoUrl || null);
        setIsFormOpen(true);
    };

    const openInfo = (machine: MachineBasicFragment) => {
        setViewingMachine(machine);
        setIsInfoOpen(true);
    };

    const API_BASE = import.meta.env.VITE_GRAPHQL_URL?.replace('/graphql', '') ?? 'http://localhost:3000';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/api/uploads`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Error al subir la imagen');
            }
            const { url } = await res.json();
            const fullUrl = `${API_BASE}${url}`;
            setValue('machinePhotoUrl', fullUrl);
            setPhotoPreview(fullUrl);
            toast.success('Imagen subida correctamente');
        } catch (err: any) {
            toast.error(err.message || 'Error al subir la imagen');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removePhoto = () => {
        setValue('machinePhotoUrl', '');
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /** Al cambiar el área en el form, resetear sub-área */
    const handleAreaChange = (areaId: string) => {
        hookAreaChange(areaId);        // hook maneja la cascada de queries
        setValue('areaId', areaId);
        setValue('subAreaId', '');       // limpiar sub-área del form
    };


    const onSubmit = async (values: MachineFormValues) => {
        setIsSaving(true);
        try {
            const payload: any = {
                code: values.code,
                name: values.name,
                description: values.description || undefined,
                brand: values.brand || undefined,
                model: values.model || undefined,
                serialNumber: values.serialNumber || undefined,
                installationDate: values.installationDate
                    ? new Date(values.installationDate).toISOString()
                    : undefined,
                machinePhotoUrl: values.machinePhotoUrl || undefined,
                operationalManualUrl: values.operationalManualUrl || undefined,
            };

            // ── XOR: enviar areaId O subAreaId, nunca ambos ──
            if (values.subAreaId) {
                payload.subAreaId = values.subAreaId;
                // NO enviar areaId cuando hay subAreaId
            } else {
                payload.areaId = values.areaId;
                // NO enviar subAreaId cuando hay areaId directo
            }

            if (editingMachine) {
                await updateMachine({ variables: { id: editingMachine.id, input: payload } });
                toast.success('Máquina actualizada correctamente');
            } else {
                await createMachine({ variables: { input: payload } });
                toast.success('Máquina creada correctamente');
            }
            setIsFormOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar la máquina');
        } finally {
            setIsSaving(false);
        }
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
        } catch (err: any) {
            toast.error(err.message || 'Error al activar');
        }
    };

    const confirmDeactivate = async () => {
        if (!deactivatingMachine) return;
        try {
            await deactivateMachine({ variables: { id: deactivatingMachine.id } });
            toast.success(`"${deactivatingMachine.name}" desactivada`);
            setDeactivatingMachine(null);
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Error al desactivar');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterAreaId('all');
        setFilterStatus('all');
    };

    // ─── Helper de errores del form
    const FieldError = ({ name }: { name: keyof MachineFormValues }) => {
        const err = errors[name];
        return err ? <p className="text-xs text-destructive mt-1">{err.message}</p> : null;
    };

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Máquinas</h1>
                    <p className="text-sm text-muted-foreground">
                        {machines.length} máquina{machines.length !== 1 ? 's' : ''} registrada
                        {machines.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={openCreateForm} className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Nueva Máquina
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={filterAreaId} onValueChange={setFilterAreaId}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <SelectValue placeholder="Área" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las áreas</SelectItem>
                            {areas.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                    {a.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filterStatus}
                        onValueChange={(v) => setFilterStatus(v as 'all' | 'active' | 'inactive')}
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
                            {hasActiveFilters ? 'Sin resultados' : 'Sin máquinas'}
                        </EmptyTitle>
                        <EmptyDescription>
                            {hasActiveFilters
                                ? 'Intenta ajustar los filtros de búsqueda.'
                                : 'Aún no se ha registrado ninguna máquina.'}
                        </EmptyDescription>
                    </EmptyHeader>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </Empty>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMachines.map((machine) => (
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
            )}

            {/* ─── Modal: Crear / Editar ──────────────────────────── */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMachine ? 'Editar Máquina' : 'Nueva Máquina'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMachine
                                ? `Modificando ${editingMachine.code} - ${editingMachine.name}`
                                : 'Completa los datos para registrar una máquina.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                        {/* Identificación */}
                        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                                Identificación
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Código *</Label>
                                    <Input {...register('code')} placeholder="Ej: MAQ-001" />
                                    <FieldError name="code" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Nombre *</Label>
                                    <Input {...register('name')} placeholder="Nombre de la máquina" />
                                    <FieldError name="name" />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label>Descripción</Label>
                                    <Input {...register('description')} placeholder="Descripción opcional" />
                                </div>
                            </div>
                        </div>

                        {/* Ubicación (Área → Sub-área) */}
                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                                Ubicación
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Área *</Label>
                                    <Controller
                                        name="areaId"
                                        control={control}
                                        render={() => (
                                            <Combobox
                                                options={areas.map((a: any) => ({ value: a.id, label: a.name }))}
                                                value={watch('areaId')}
                                                onValueChange={handleAreaChange}
                                                placeholder="Seleccionar área..."
                                                searchPlaceholder="Buscar área..."
                                            />
                                        )}
                                    />
                                    <FieldError name="areaId" />
                                </div>
                                {selectedAreaId && subAreasLoaded && hasSubAreas && (
                                    <div className="space-y-1.5">
                                        <Label>Sub-área (Opcional)</Label>
                                        <Controller
                                            name="subAreaId"
                                            control={control}
                                            render={({ field }) => (
                                                <Combobox
                                                    options={subAreas.map((sa: any) => ({ value: sa.id, label: sa.name }))}
                                                    value={field.value}
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        hookSubAreaChange(val);
                                                    }}
                                                    placeholder={subAreasLoading ? 'Cargando...' : 'Seleccionar sub-área (opcional)...'}
                                                    searchPlaceholder="Buscar sub-área..."
                                                    disabled={subAreasLoading}
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Especificaciones técnicas */}
                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                                Especificaciones
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Marca</Label>
                                    <Input {...register('brand')} placeholder="Ej: Siemens" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Modelo</Label>
                                    <Input {...register('model')} placeholder="Ej: S7-1200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Número de serie</Label>
                                    <Input {...register('serialNumber')} placeholder="Ej: SN-123456" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Fecha de instalación</Label>
                                    <Input type="date" {...register('installationDate')} />
                                </div>
                            </div>
                        </div>

                        {/* Foto + Documentación */}
                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                                Foto y Documentación
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Foto de máquina</Label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {photoPreview ? (
                                        <div className="relative rounded-lg border border-border overflow-hidden">
                                            <img
                                                src={photoPreview}
                                                alt="Foto de máquina"
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon-sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    title="Cambiar imagen"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    onClick={removePhoto}
                                                    title="Eliminar imagen"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-24 flex flex-col gap-1.5 text-muted-foreground"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span className="text-xs">Subiendo...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-5 w-5" />
                                                    <span className="text-xs">Haz clic para subir una imagen</span>
                                                    <span className="text-[10px]">JPG, PNG o WebP (máx. 5MB)</span>
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>URL Manual operativo</Label>
                                    <Input
                                        {...register('operationalManualUrl')}
                                        placeholder="https://..."
                                        type="url"
                                    />
                                    <FieldError name="operationalManualUrl" />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border sticky bottom-0 bg-background">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingMachine ? 'Guardar cambios' : 'Crear máquina'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                        <AlertDialogTitle>¿Desactivar máquina?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La máquina <strong>{deactivatingMachine?.name}</strong> (
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