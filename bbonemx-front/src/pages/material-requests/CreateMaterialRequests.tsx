import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
    GetMaterialRequestFormDataDocument,
    GetMachinesByAreaDocument,
    MachineBasicFragmentDoc,
    CreateMaterialRequestDocument,
    AddMaterialToRequestDocument,
    GetMaterialRequestDocument,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Loader2,
    Package,
    AlertCircle,
} from 'lucide-react';

import {
    CATEGORY_LABELS,
    PRIORITY_LABELS,
    IMPORTANCE_LABELS,
} from './MaterialRequestsPage';

// ─── Categorías SKU: requieren brand + partNumber + stock al ingresar manual ─

const SKU_CATEGORIES = new Set([
    'MATERIAL_WITH_SKU',
    'SPARE_PART_WITH_SKU',
    'REQUEST_SKU_MATERIAL',
    'REQUEST_SKU_SPARE_PART',
    'UPDATE_SKU',
]);

const MATERIAL_CATEGORIES = new Set([
    'MATERIAL_WITH_SKU',
    'NON_INVENTORY_MATERIAL',
    'REQUEST_SKU_MATERIAL',
    'UPDATE_SKU',
]);

const SPARE_PART_CATEGORIES = new Set([
    'SPARE_PART_WITH_SKU',
    'NON_INVENTORY_SPARE_PART',
    'REQUEST_SKU_SPARE_PART',
]);

// ─── Schema Yup ──────────────────────────────────────────────────────────────

const itemSchema = yup.object({
    // ID del catálogo seleccionado, o 'OTHER' para manual, o '' para sin selección
    catalogId: yup.string().default(''),
    isManual: yup.boolean().default(false),
    brand: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    partNumber: yup.string().trim().default(''),
    sku: yup.string().trim().default(''),
    description: yup.string().trim().default(''),
    unitOfMeasure: yup.string().trim().required('Unidad requerida'),
    requestedQuantity: yup
        .number()
        .typeError('Ingresa la cantidad')
        .positive('Debe ser mayor a 0')
        .required('Requerido'),
    proposedMaxStock: yup.number().nullable().transform((v, o) => (o === '' || o === null ? null : v)).default(null),
    proposedMinStock: yup.number().nullable().transform((v, o) => (o === '' || o === null ? null : v)).default(null),
});

const schema = yup.object({
    requesterId: yup.string().required('Selecciona el solicitante'),
    category: yup.string().required('Selecciona la categoría'),
    priority: yup.string().required('Selecciona la prioridad'),
    // boss: ahora viene de bossesByPositionName (fullName del user)
    boss: yup.string().trim().required('Selecciona el jefe a cargo'),
    areaId: yup.string().required('Selecciona un área'),
    machineId: yup.string().required('Selecciona una máquina'),
    importance: yup.string().required('Selecciona la importancia'),
    isGenericAllowed: yup.boolean().required(),
    justification: yup.string().trim().default(''),
    comments: yup.string().trim().default(''),
    suggestedSupplier: yup.string().trim().default(''),
    items: yup.array(itemSchema).min(1, 'Agrega al menos un artículo').required(),
});

type FormValues = yup.InferType<typeof schema>;

const EMPTY_ITEM: FormValues['items'][0] = {
    catalogId: '',
    isManual: false,
    brand: '',
    model: '',
    partNumber: '',
    sku: '',
    description: '',
    unitOfMeasure: 'pza',
    requestedQuantity: 1,
    proposedMaxStock: null,
    proposedMinStock: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateMaterialRequestPage() {
    const navigate = useNavigate();
    const { id: editId } = useParams<{ id: string }>(); // si viene de /editar
    const isEdit = !!editId;

    const [isSaving, setIsSaving] = useState(false);
    const [globalError, setGlobalError] = useState('');

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: formData, loading: formLoading } = useQuery(
        GetMaterialRequestFormDataDocument,
        { fetchPolicy: 'cache-and-network' },
    );

    // Solo carga si estamos en modo edición
    const { data: editData, loading: editLoading } = useQuery(
        GetMaterialRequestDocument,
        {
            variables: { id: editId! },
            skip: !isEdit,
            fetchPolicy: 'cache-and-network',
        },
    );

    // ── Mutations ─────────────────────────────────────────────────────────────
    const [createRequest] = useMutation(CreateMaterialRequestDocument);
    const [addItemToRequest] = useMutation(AddMaterialToRequestDocument);

    // ── Form ──────────────────────────────────────────────────────────────────
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            requesterId: '',
            category: '',
            priority: '',
            boss: '',
            areaId: '',
            machineId: '',
            importance: '',
            isGenericAllowed: false,
            justification: '',
            comments: '',
            suggestedSupplier: '',
            items: [{ ...EMPTY_ITEM }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    // ── Pre-rellenar formulario al editar ─────────────────────────────────────
    useEffect(() => {
        if (!isEdit || !editData?.materialRequest) return;
        const req = editData.materialRequest;

        // Necesitamos el areaId de la máquina para pre-seleccionar el área
        const areaId = req.machine.areaId ?? req.machine.subArea?.id ?? '';

        reset({
            requesterId: req.requester.id,
            category: req.category,
            priority: req.priority,
            boss: req.boss,
            areaId,
            machineId: req.machine.id,
            importance: req.importance,
            isGenericAllowed: req.isGenericAllowed,
            justification: req.justification ?? '',
            comments: req.comments ?? '',
            suggestedSupplier: req.suggestedSupplier ?? '',
            items: req.items.length > 0
                ? req.items.map((item) => ({
                    catalogId: item.materialId || item.sparePartId || (item.brand || item.partNumber ? 'OTHER' : ''),
                    isManual: !item.materialId && !item.sparePartId,
                    brand: item.brand ?? '',
                    model: item.model ?? '',
                    partNumber: item.partNumber ?? '',
                    sku: item.sku ?? '',
                    description: item.description ?? '',
                    unitOfMeasure: item.unitOfMeasure ?? 'pza',
                    requestedQuantity: item.requestedQuantity ?? 1,
                    proposedMaxStock: item.proposedMaxStock ?? null,
                    proposedMinStock: item.proposedMinStock ?? null,
                }))
                : [{ ...EMPTY_ITEM }],
        });
    }, [isEdit, editData, reset]);

    // ── Máquinas por área ─────────────────────────────────────────────────────
    const watchedAreaId = watch('areaId');
    const watchedMachineId = watch('machineId');
    const watchedCategory = watch('category');

    const { data: machinesData, loading: machinesLoading } = useQuery(
        GetMachinesByAreaDocument,
        {
            variables: { areaId: watchedAreaId },
            skip: !watchedAreaId,
            fetchPolicy: 'cache-and-network',
        },
    );

    // ── Datos derivados ───────────────────────────────────────────────────────
    const areas = formData?.areasActive ?? [];
    const allUsers = formData?.usersWithDeleted ?? [];
    const bosses = formData?.bossesByPositionName ?? [];
    const materials = formData?.materialsActive ?? [];
    const spareParts = formData?.sparePartsActive ?? [];
    const machines = machinesData?.machinesByArea
        ? unmaskFragment(MachineBasicFragmentDoc, machinesData.machinesByArea)
        : [];

    const isSKUCategory = SKU_CATEGORIES.has(watchedCategory);
    const isMaterialCategory = MATERIAL_CATEGORIES.has(watchedCategory);
    const isSparePartCategory = SPARE_PART_CATEGORIES.has(watchedCategory);

    const catalogItems = useMemo(() => {
        if (isMaterialCategory) {
            return materials.map((m) => ({
                id: m.id,
                label: `${m.description}${m.partNumber ? ` · ${m.partNumber}` : ''}`,
                brand: m.brand ?? '',
                model: m.model ?? '',
                partNumber: m.partNumber ?? '',
                sku: m.sku ?? '',
                unitOfMeasure: m.unitOfMeasure ?? 'pza',
            }));
        }
        if (isSparePartCategory) {
            return spareParts.map((s) => ({
                id: s.id,
                label: `${s.partNumber}${s.brand ? ` · ${s.brand}` : ''}`,
                brand: s.brand ?? '',
                model: s.model ?? '',
                partNumber: s.partNumber,
                sku: '',
                unitOfMeasure: s.unitOfMeasure ?? 'pza',
            }));
        }
        return [];
    }, [isMaterialCategory, isSparePartCategory, materials, spareParts]);

    // ── Auto-rellenar campos al seleccionar catálogo ──────────────────────────
    const handleCatalogSelect = useCallback(
        (index: number, catalogId: string) => {
            if (catalogId === 'OTHER') {
                setValue(`items.${index}.catalogId`, 'OTHER');
                setValue(`items.${index}.isManual`, true);
                setValue(`items.${index}.brand`, '');
                setValue(`items.${index}.model`, '');
                setValue(`items.${index}.partNumber`, '');
                setValue(`items.${index}.sku`, '');
                return;
            }
            const found = catalogItems.find((c) => c.id === catalogId);
            setValue(`items.${index}.catalogId`, catalogId);
            setValue(`items.${index}.isManual`, false);
            if (found) {
                setValue(`items.${index}.brand`, found.brand);
                setValue(`items.${index}.model`, found.model);
                setValue(`items.${index}.partNumber`, found.partNumber);
                setValue(`items.${index}.sku`, found.sku);
                setValue(`items.${index}.unitOfMeasure`, found.unitOfMeasure);
            }
        },
        [catalogItems, setValue],
    );

    // ── Submit: creación en dos pasos ─────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        setIsSaving(true);
        setGlobalError('');

        try {
            // Validación extra para SKU categories con entrada manual
            if (isSKUCategory) {
                for (let i = 0; i < values.items.length; i++) {
                    const item = values.items[i];
                    if (!item.isManual) continue;
                    if (!item.brand || !item.partNumber) {
                        setGlobalError(
                            `Artículo ${i + 1}: En categoría SKU, los artículos manuales requieren marca y número de parte.`,
                        );
                        setIsSaving(false);
                        return;
                    }
                    const max = item.proposedMaxStock ?? 0;
                    const min = item.proposedMinStock ?? 0;
                    if (min < 0 || max <= min) {
                        setGlobalError(
                            `Artículo ${i + 1}: Stock máximo debe ser mayor al mínimo y mínimo >= 0.`,
                        );
                        setIsSaving(false);
                        return;
                    }
                }
            }

            // ── PASO 1: Crear solicitud sin items ─────────────────────────────
            const { data: createdData } = await createRequest({
                variables: {
                    input: {
                        requesterId: values.requesterId,
                        category: values.category,
                        priority: values.priority,
                        importance: values.importance,
                        boss: values.boss,
                        machineId: values.machineId,
                        isGenericAllowed: values.isGenericAllowed,
                        justification: values.justification || undefined,
                        comments: values.comments || undefined,
                        suggestedSupplier: values.suggestedSupplier || undefined,
                        items: [],
                        customMachineBrand: '',
                        customMachineManufacturer: '',
                        customMachineModel: '',
                        customMachineName: ''
                    },
                },
            });

            const newRequestId = createdData?.createMaterialRequest?.id;
            if (!newRequestId) throw new Error('No se pudo obtener el ID de la solicitud creada.');

            // ── PASO 2: Agregar cada item con el ID real ──────────────────────
            for (const item of values.items) {
                const isFromMaterial = isMaterialCategory && item.catalogId && item.catalogId !== 'OTHER';
                const isFromSparePart = isSparePartCategory && item.catalogId && item.catalogId !== 'OTHER';

                await addItemToRequest({
                    variables: {
                        materialRequestId: newRequestId,
                        input: {
                            materialRequestId: newRequestId, // requerido por el input type
                            materialId: isFromMaterial ? item.catalogId : undefined,
                            sparePartId: isFromSparePart ? item.catalogId : undefined,
                            brand: item.brand || undefined,
                            model: item.model || undefined,
                            partNumber: item.partNumber || undefined,
                            sku: item.sku || undefined,
                            description: item.description || undefined,
                            unitOfMeasure: item.unitOfMeasure,
                            requestedQuantity: item.requestedQuantity,
                            proposedMaxStock: item.proposedMaxStock ?? undefined,
                            proposedMinStock: item.proposedMinStock ?? undefined,
                        },
                    },
                });
            }

            navigate(`/solicitudes-material/${newRequestId}`);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error al guardar la solicitud.';
            setGlobalError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    const isLoading = formLoading || (isEdit && editLoading);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="space-y-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(isEdit ? `/solicitudes-material/${editId}` : '/solicitudes-material')}
                    className="gap-1.5 -ml-2 text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isEdit ? 'Volver al detalle' : 'Solicitudes'}
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                    {isEdit ? 'Editar Solicitud' : 'Nueva Solicitud de Material'}
                </h1>
            </div>

            {globalError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* ── Sección 1: Información de la solicitud ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">1. Información de la solicitud</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Solicitante */}
                        <div className="space-y-1.5">
                            <Label>Solicitante <span className="text-destructive">*</span></Label>
                            <Controller
                                name="requesterId"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el solicitante" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allUsers
                                                .filter((u) => u.isActive)
                                                .map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>
                                                        {u.fullName}
                                                        {u.employeeNumber ? ` · ${u.employeeNumber}` : ''}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.requesterId && (
                                <p className="text-xs text-destructive">{errors.requesterId.message}</p>
                            )}
                        </div>

                        {/* Qué solicita (categoría) */}
                        <div className="space-y-1.5">
                            <Label>Qué solicita <span className="text-destructive">*</span></Label>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona la categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                                <SelectItem key={val} value={val}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.category && (
                                <p className="text-xs text-destructive">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Prioridad */}
                        <div className="space-y-1.5">
                            <Label>Prioridad <span className="text-destructive">*</span></Label>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona la prioridad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                                                <SelectItem key={val} value={val}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.priority && (
                                <p className="text-xs text-destructive">{errors.priority.message}</p>
                            )}
                        </div>

                        {/* Jefe a cargo — desde bossesByPositionName */}
                        <div className="space-y-1.5">
                            <Label>Jefe a cargo <span className="text-destructive">*</span></Label>
                            <Controller
                                name="boss"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el jefe responsable" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bosses.length === 0 ? (
                                                <SelectItem value="_empty" disabled>
                                                    Sin jefes disponibles
                                                </SelectItem>
                                            ) : (
                                                bosses
                                                    .filter((b) => b.isActive)
                                                    .map((b) => (
                                                        <SelectItem
                                                            key={b.id}
                                                            value={b.user.fullName}
                                                        >
                                                            {b.user.fullName}
                                                            {b.position?.name ? ` · ${b.position.name}` : ''}
                                                        </SelectItem>
                                                    ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.boss && (
                                <p className="text-xs text-destructive">{errors.boss.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Sección 2: Equipo / Estructura ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">2. Equipo o Estructura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Área */}
                        <div className="space-y-1.5">
                            <Label>Área <span className="text-destructive">*</span></Label>
                            <Controller
                                name="areaId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('machineId', ''); // reset máquina al cambiar área
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>
                                                    {a.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.areaId && (
                                <p className="text-xs text-destructive">{errors.areaId.message}</p>
                            )}
                        </div>

                        {/* Máquina — solo cuando hay área seleccionada */}
                        {watchedAreaId && (
                            <div className="space-y-1.5">
                                <Label>Máquina <span className="text-destructive">*</span></Label>
                                <Controller
                                    name="machineId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={machinesLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        machinesLoading
                                                            ? 'Cargando máquinas...'
                                                            : machines.length === 0
                                                                ? 'Sin máquinas en esta área'
                                                                : 'Selecciona la máquina'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {machines.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name} · <span className="font-mono">{m.code}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.machineId && (
                                    <p className="text-xs text-destructive">{errors.machineId.message}</p>
                                )}
                                {!machinesLoading && machines.length === 0 && watchedAreaId && (
                                    <p className="text-xs text-amber-600">
                                        No hay máquinas activas en el área seleccionada.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Info de la máquina seleccionada */}
                        {watchedMachineId && watchedMachineId !== '' && (() => {
                            const selected = machines.find((m) => m.id === watchedMachineId);
                            if (!selected) return null;
                            return (
                                <div className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 space-y-0.5 border border-border/50">
                                    {selected.brand && <p><span className="font-medium">Marca:</span> {selected.brand}</p>}
                                    {selected.model && <p><span className="font-medium">Modelo:</span> {selected.model}</p>}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* ── Sección 3: Artículos solicitados ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">3. Artículos Solicitados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {isSKUCategory && (
                            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                                Categoría SKU — para artículos de ingreso manual se requieren: marca, número de parte y stock mínimo/máximo.
                            </div>
                        )}

                        <div className="space-y-3">
                            {fields.map((field, index) => {
                                const isManual = watch(`items.${index}.isManual`);
                                const catalogId = watch(`items.${index}.catalogId`);
                                const isCatalogSelected = Boolean(catalogId && catalogId !== 'OTHER' && catalogId !== '');
                                // Los campos de referencia se deshabilitan si viene del catálogo
                                const refFieldsDisabled = Boolean(!isManual && isCatalogSelected);

                                return (
                                    <div
                                        key={field.id}
                                        className="border border-border rounded-lg p-3 space-y-3 bg-muted/20"
                                    >
                                        {/* Header del ítem */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Artículo {index + 1}
                                            </span>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive hover:text-destructive/80"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Selector de catálogo */}
                                        {(isMaterialCategory || isSparePartCategory) && (
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">
                                                    {isMaterialCategory ? 'Material del catálogo' : 'Refacción del catálogo'}
                                                </Label>
                                                <Select
                                                    value={catalogId || ''}
                                                    onValueChange={(val) => handleCatalogSelect(index, val)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Selecciona o elige Otro" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {catalogItems.map((c) => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.label}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="OTHER">
                                                            Otro (ingreso manual)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Campos de referencia */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    Marca
                                                    {isSKUCategory && isManual && (
                                                        <span className="text-destructive ml-0.5">*</span>
                                                    )}
                                                </Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="Marca"
                                                    disabled={refFieldsDisabled}
                                                    {...register(`items.${index}.brand`)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Modelo</Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="Modelo"
                                                    disabled={refFieldsDisabled}
                                                    {...register(`items.${index}.model`)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    No. Parte
                                                    {isSKUCategory && isManual && (
                                                        <span className="text-destructive ml-0.5">*</span>
                                                    )}
                                                </Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="Número de parte"
                                                    disabled={refFieldsDisabled}
                                                    {...register(`items.${index}.partNumber`)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">SKU</Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="SKU"
                                                    disabled={refFieldsDisabled}
                                                    {...register(`items.${index}.sku`)}
                                                />
                                            </div>
                                        </div>

                                        {/* Cantidad y unidad */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    Cantidad <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0.01}
                                                    step="any"
                                                    className="h-8 text-xs"
                                                    {...register(`items.${index}.requestedQuantity`, { valueAsNumber: true })}
                                                />
                                                {errors.items?.[index]?.requestedQuantity && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.items[index]!.requestedQuantity!.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    Unidad <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="pza, lt, kg..."
                                                    {...register(`items.${index}.unitOfMeasure`)}
                                                />
                                                {errors.items?.[index]?.unitOfMeasure && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.items[index]!.unitOfMeasure!.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stock mín/máx — solo para categorías SKU */}
                                        {isSKUCategory && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Stock Mín
                                                        {isManual && <span className="text-destructive ml-0.5">*</span>}
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="any"
                                                        className="h-8 text-xs"
                                                        placeholder="0"
                                                        {...register(`items.${index}.proposedMinStock`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Stock Máx
                                                        {isManual && <span className="text-destructive ml-0.5">*</span>}
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="any"
                                                        className="h-8 text-xs"
                                                        placeholder="0"
                                                        {...register(`items.${index}.proposedMaxStock`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Descripción del ítem */}
                                        <div className="space-y-1">
                                            <Label className="text-xs">Descripción / especificaciones</Label>
                                            <Input
                                                className="h-8 text-xs"
                                                placeholder="Descripción del artículo (opcional)"
                                                {...register(`items.${index}.description`)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Error de array */}
                        {errors.items && !Array.isArray(errors.items) && 'message' in errors.items && (
                            <p className="text-xs text-destructive">{(errors.items as { message?: string }).message}</p>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 w-full"
                            onClick={() => append({ ...EMPTY_ITEM })}
                        >
                            <Plus className="h-4 w-4" />
                            Agregar artículo
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Sección 4: Importancia y compatibilidad ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">4. Importancia y Compatibilidad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="space-y-1.5">
                            <Label>Importancia <span className="text-destructive">*</span></Label>
                            <Controller
                                name="importance"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona la importancia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(IMPORTANCE_LABELS).map(([val, label]) => (
                                                <SelectItem key={val} value={val}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.importance && (
                                <p className="text-xs text-destructive">{errors.importance.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>¿Puede ser genérico o de modelo diferente?</Label>
                            <Controller
                                name="isGenericAllowed"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex gap-6">
                                        {([true, false] as const).map((val) => (
                                            <label
                                                key={String(val)}
                                                className="flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    type="radio"
                                                    checked={field.value === val}
                                                    onChange={() => field.onChange(val)}
                                                    className="accent-primary h-4 w-4"
                                                />
                                                <span className="text-sm">{val ? 'Sí' : 'No'}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ── Sección 5: Información adicional ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">5. Información Adicional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="justification">Justificante</Label>
                            <Textarea
                                id="justification"
                                rows={3}
                                placeholder="Describe la razón de esta solicitud..."
                                {...register('justification')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="comments">Comentarios</Label>
                            <Textarea
                                id="comments"
                                rows={2}
                                placeholder="Comentarios adicionales..."
                                {...register('comments')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="suggestedSupplier">Sugerencia de proveedor</Label>
                            <Input
                                id="suggestedSupplier"
                                placeholder="Nombre del proveedor sugerido"
                                {...register('suggestedSupplier')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Botón guardar */}
                <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSaving}
                    size="lg"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Package className="h-4 w-4" />
                            {isEdit ? 'Actualizar Solicitud' : 'Guardar Solicitud'}
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}