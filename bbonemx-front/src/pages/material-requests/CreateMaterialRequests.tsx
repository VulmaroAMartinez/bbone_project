import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
    GET_MATERIAL_REQUEST_FORM_DATA_QUERY,
    CREATE_MATERIAL_REQUEST_MUTATION,
    UPDATE_MATERIAL_REQUEST_MUTATION,
    ADD_MATERIAL_TO_REQUEST_MUTATION,
    REMOVE_MATERIAL_FROM_REQUEST_MUTATION,
    GET_MATERIAL_REQUEST_QUERY,
} from '@/lib/graphql/operations/material-requests';
import { shouldClearItemsOnCategoryChange } from '@/lib/material-requests/material-request-logic';

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
import { Combobox } from '@/components/ui/combobox';
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
} from '@/components/material-requests/material-request.constants';

// ─── Helpers de categoría ────────────────────────────────────────────────────

const SERVICE_CATEGORIES = new Set(['SERVICE']);

const MATERIAL_CATEGORIES = new Set([
    'MATERIAL_WITH_SKU',
    'NON_INVENTORY_MATERIAL',
    'REQUEST_SKU_MATERIAL',
    'UPDATE_SKU',
    'SERVICE_WITH_MATERIAL',
]);

const SPARE_PART_CATEGORIES = new Set([
    'SPARE_PART_WITH_SKU',
    'NON_INVENTORY_SPARE_PART',
    'REQUEST_SKU_SPARE_PART',
]);

const SKU_CATEGORIES = new Set([
    'MATERIAL_WITH_SKU',
    'SPARE_PART_WITH_SKU',
    'REQUEST_SKU_MATERIAL',
    'REQUEST_SKU_SPARE_PART',
    'UPDATE_SKU',
]);

// ─── Schema ──────────────────────────────────────────────────────────────────

const itemSchema = yup.object({
    dbId: yup.string().default(''), // ID real en BD; vacío = item nuevo no guardado
    catalogId: yup.string().default(''),
    isManual: yup.boolean().default(false),
    customName: yup.string().trim().default(''),
    brand: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    partNumber: yup.string().trim().default(''),
    sku: yup.string().trim().default(''),
    unitOfMeasure: yup.string().trim().required('Unidad requerida'),
    requestedQuantity: yup
        .number()
        .typeError('Ingresa la cantidad')
        .positive('Debe ser mayor a 0')
        .required('Requerido'),
    proposedMaxStock: yup.number().nullable().transform((v, o) => (o === '' || o === null ? null : v)).default(null),
    proposedMinStock: yup.number().nullable().transform((v, o) => (o === '' || o === null ? null : v)).default(null),
    isGenericAllowed: yup.boolean().default(false),
});

const schema = yup.object({
    requesterId: yup.string().required('Selecciona el solicitante'),
    category: yup.string().required('Selecciona la categoría'),
    priority: yup.string().required('Selecciona la prioridad'),
    boss: yup.string().trim().required('Selecciona el jefe a cargo'),
    machineIds: yup.array(yup.string().required()).min(1, 'Selecciona al menos una máquina').required(),
    // Campos editables del equipo (se guardan en material_requests)
    customMachineBrand: yup.string().trim().default(''),
    customMachineModel: yup.string().trim().default(''),
    customMachineManufacturer: yup.string().trim().default(''),
    importance: yup.string().required('Selecciona la importancia'),
    description: yup.string().trim().default(''),
    justification: yup.string().trim().default(''),
    comments: yup.string().trim().default(''),
    suggestedSupplier: yup.string().trim().default(''),
    items: yup.array(itemSchema).default([]),
});

type FormValues = yup.InferType<typeof schema>;

const EMPTY_ITEM: FormValues['items'][0] = {
    dbId: '',
    catalogId: '',
    isManual: false,
    customName: '',
    brand: '',
    model: '',
    partNumber: '',
    sku: '',
    unitOfMeasure: 'pza',
    requestedQuantity: 1,
    proposedMaxStock: null,
    proposedMinStock: null,
    isGenericAllowed: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateMaterialRequestPage() {
    const navigate = useNavigate();
    const { id: editId } = useParams<{ id: string }>();
    const isEdit = !!editId;

    const [isSaving, setIsSaving] = useState(false);
    const [globalError, setGlobalError] = useState('');

    // ── Queries ──────────────────────────────────────────────────────────────
    type MaterialRequestFormData = {
        techniciansActive: Array<{
            user: { id: string; fullName: string; employeeNumber?: string | null };
            position?: { name: string } | null;
        }>;
        usersWithDeleted: Array<{
            id: string;
            fullName: string;
            employeeNumber?: string | null;
            isActive: boolean;
            roles?: Array<{ name: string }>;
        }>;
        machinesActive: Array<{
            id: string;
            name: string;
            brand?: string | null;
            model?: string | null;
            manufacturer?: string | null;
            area?: { name: string } | null;
            subArea?: { name: string; area?: { name: string } | null } | null;
        }>;
        materialsActive: Array<{
            id: string;
            description: string;
            brand?: string | null;
            model?: string | null;
            partNumber?: string | null;
            sku?: string | null;
            unitOfMeasure?: string | null;
        }>;
        sparePartsActive: Array<{
            id: string;
            partNumber: string;
            sku?: string | null;
            brand?: string | null;
            model?: string | null;
            unitOfMeasure?: string | null;
        }>;
    };

    const { data: formData, loading: formLoading } = useQuery<MaterialRequestFormData>(
        GET_MATERIAL_REQUEST_FORM_DATA_QUERY,
        { fetchPolicy: 'cache-and-network' },
    );

    type MaterialRequestEditData = {
        materialRequest: {
            id: string;
            requester: { id: string };
            category: string;
            priority: string;
            boss: string;
            machines?: Array<{ machine: { id: string } }>;
            machine: { brand?: string | null; model?: string | null; manufacturer?: string | null };
            customMachineBrand?: string | null;
            customMachineModel?: string | null;
            customMachineManufacturer?: string | null;
            importance: string;
            description?: string | null;
            justification?: string | null;
            comments?: string | null;
            suggestedSupplier?: string | null;
            items: Array<{
                id: string;
                materialId?: string | null;
                sparePartId?: string | null;
                customName?: string | null;
                brand?: string | null;
                model?: string | null;
                partNumber?: string | null;
                sku?: string | null;
                unitOfMeasure?: string | null;
                requestedQuantity?: number | null;
                proposedMaxStock?: number | null;
                proposedMinStock?: number | null;
                isGenericAllowed?: boolean | null;
            }>;
        };
    };

    const { data: editData, loading: editLoading } = useQuery<MaterialRequestEditData>(
        GET_MATERIAL_REQUEST_QUERY,
        {
            variables: { id: editId! },
            skip: !isEdit,
            fetchPolicy: 'cache-and-network',
        },
    );

    // ── Mutations ─────────────────────────────────────────────────────────────
    type CreateRequestResult = { createMaterialRequest?: { id: string } | null };
    type CreateRequestVars = { input: Record<string, unknown> };
    type UpdateRequestResult = Record<string, unknown>;
    type UpdateRequestVars = { id: string; input: Record<string, unknown> };
    type AddItemResult = Record<string, unknown>;
    type AddItemVars = { materialRequestId: string; input: Record<string, unknown> };

    type RemoveItemResult = { removeMaterialFromRequest: boolean };
    type RemoveItemVars = { materialRequestMaterialId: string };

    const [createRequest] = useMutation<CreateRequestResult, CreateRequestVars>(CREATE_MATERIAL_REQUEST_MUTATION);
    const [updateRequest] = useMutation<UpdateRequestResult, UpdateRequestVars>(UPDATE_MATERIAL_REQUEST_MUTATION);
    const [addItemToRequest] = useMutation<AddItemResult, AddItemVars>(ADD_MATERIAL_TO_REQUEST_MUTATION);
    const [removeItemFromRequest] = useMutation<RemoveItemResult, RemoveItemVars>(REMOVE_MATERIAL_FROM_REQUEST_MUTATION);

    // IDs de los items que ya existían en BD al cargar el formulario de edición
    const originalItemIdsRef = useRef<string[]>([]);

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
            machineIds: [],
            customMachineBrand: '',
            customMachineModel: '',
            customMachineManufacturer: '',
            importance: '',
            description: '',
            justification: '',
            comments: '',
            suggestedSupplier: '',
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    // ── Datos derivados ───────────────────────────────────────────────────────
    const technicians = formData?.techniciansActive ?? [];
    const allUsers = useMemo(() => formData?.usersWithDeleted ?? [], [formData?.usersWithDeleted]);
    const machines = useMemo(() => formData?.machinesActive ?? [], [formData?.machinesActive]);
    const materials = useMemo(() => formData?.materialsActive ?? [], [formData?.materialsActive]);
    const spareParts = useMemo(() => formData?.sparePartsActive ?? [], [formData?.sparePartsActive]);

    // Jefes: usuarios activos con rol BOSS
    const bosses = useMemo(
        () => allUsers.filter(
            (u) => u.isActive && u.roles?.some((r) => r.name === 'BOSS')
        ),
        [allUsers],
    );

    const watchedMachineIds = watch('machineIds');
    const watchedCategory = watch('category');

    const isService = SERVICE_CATEGORIES.has(watchedCategory);
    const isMaterialCategory = MATERIAL_CATEGORIES.has(watchedCategory);
    const isSparePartCategory = SPARE_PART_CATEGORIES.has(watchedCategory);
    const isSKUCategory = SKU_CATEGORIES.has(watchedCategory);
    const showItems = !isService && !!watchedCategory;

    // Máquinas seleccionadas
    const selectedMachines = useMemo(
        () => (watchedMachineIds ?? []).map((id: string) => machines.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => Boolean(m)),
        [machines, watchedMachineIds],
    );

    // Para compatibilidad: la primera máquina seleccionada (usada en customMachine auto-fill)
    const selectedMachine = selectedMachines[0] ?? null;

    // Nombre del área derivada de las máquinas
    const derivedAreaName = useMemo(() => {
        const areas = new Set(
            selectedMachines.map((m) => m.area?.name ?? m.subArea?.area?.name).filter(Boolean),
        );
        if (areas.size === 1) return [...areas][0];
        if (areas.size > 1) return 'Diversas áreas';
        return '';
    }, [selectedMachines]);

    // Etiqueta de la máquina en el select
    const machineLabel = useCallback((m: typeof machines[0]) => {
        const suffix = m.subArea?.name ?? m.area?.name ?? '';
        return suffix ? `${m.name} - ${suffix}` : m.name;
    }, []);

    // ── Auto-rellenar campos al cambiar máquina (solo si hay 1) ─────────────
    useEffect(() => {
        if (selectedMachines.length === 1 && selectedMachine) {
            setValue('customMachineBrand', selectedMachine.brand ?? 'N/A');
            setValue('customMachineModel', selectedMachine.model ?? 'N/A');
            setValue('customMachineManufacturer', selectedMachine.manufacturer ?? 'N/A');
        } else if (selectedMachines.length > 1) {
            setValue('customMachineBrand', '');
            setValue('customMachineModel', '');
            setValue('customMachineManufacturer', '');
        }
    }, [selectedMachines, selectedMachine, setValue]);

    // Track the previous category so we can detect catalog-type switches.
    const prevCategoryRef = useRef<string>('');

    useEffect(() => {
        if (!watchedCategory) return;

        const prevCategory = prevCategoryRef.current;

        if (isService) {
            // Switching to a service category always clears items
            remove();
        } else if (shouldClearItemsOnCategoryChange(prevCategory, watchedCategory)) {
            // Switching between material ↔ spare-part catalogs: stale catalogIds
            // from the old catalog would cause backend errors, so clear and add one
            // fresh empty item.
            remove();
            append({ ...EMPTY_ITEM });
        } else if (fields.length === 0) {
            append({ ...EMPTY_ITEM });
        }

        prevCategoryRef.current = watchedCategory;
    }, [watchedCategory, isService, remove, fields.length, append]);

    // ── Pre-rellenar formulario al editar ─────────────────────────────────────
    useEffect(() => {
        if (!isEdit || !editData?.materialRequest) return;
        const req = editData.materialRequest;

        // Guardar los IDs originales para detectar items eliminados al guardar
        originalItemIdsRef.current = req.items.map((item) => item.id);

        reset({
            requesterId: req.requester.id,
            category: req.category,
            priority: req.priority,
            boss: req.boss,
            machineIds: (req.machines ?? []).map((mrm) => mrm.machine.id),
            customMachineBrand: req.customMachineBrand ?? req.machine.brand ?? 'N/A',
            customMachineModel: req.customMachineModel ?? req.machine.model ?? 'N/A',
            customMachineManufacturer: req.customMachineManufacturer ?? req.machine.manufacturer ?? 'N/A',
            importance: req.importance,
            description: req.description ?? '',
            justification: req.justification ?? '',
            comments: req.comments ?? '',
            suggestedSupplier: req.suggestedSupplier ?? '',
            items: req.items.length > 0
                ? req.items.map((item) => ({
                    dbId: item.id,
                    catalogId: item.materialId || item.sparePartId || (item.brand || item.partNumber ? 'OTHER' : ''),
                    isManual: !item.materialId && !item.sparePartId,
                    customName: item.customName ?? '',
                    brand: item.brand ?? '',
                    model: item.model ?? '',
                    partNumber: item.partNumber ?? '',
                    sku: item.sku ?? '',
                    unitOfMeasure: item.unitOfMeasure ?? 'pza',
                    requestedQuantity: item.requestedQuantity ?? 1,
                    proposedMaxStock: item.proposedMaxStock ?? null,
                    proposedMinStock: item.proposedMinStock ?? null,
                    isGenericAllowed: item.isGenericAllowed ?? false,
                }))
                : [],
        });
    }, [isEdit, editData, reset]);

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
                sku: s.sku ?? '',
                unitOfMeasure: s.unitOfMeasure ?? 'pza',
            }));
        }
        return [];
    }, [isMaterialCategory, isSparePartCategory, materials, spareParts]);

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

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        setIsSaving(true);
        setGlobalError('');

        try {
            if (isSKUCategory && values.items.length > 0) {
                for (let i = 0; i < values.items.length; i++) {
                    const item = values.items[i];
                    if (!item.isManual) continue;
                    if (!item.brand || !item.partNumber) {
                        setGlobalError(`Artículo ${i + 1}: categoría SKU requiere marca y número de parte.`);
                        setIsSaving(false);
                        return;
                    }
                    const max = item.proposedMaxStock ?? 0;
                    const min = item.proposedMinStock ?? 0;
                    if (min < 0 || max <= min) {
                        setGlobalError(`Artículo ${i + 1}: stock máximo debe ser mayor al mínimo y mínimo >= 0.`);
                        setIsSaving(false);
                        return;
                    }
                }
            }

            const requestPayload = {
                requesterId: values.requesterId,
                category: values.category,
                priority: values.priority,
                importance: values.importance,
                boss: values.boss,
                machineIds: values.machineIds,
                customMachineBrand: values.customMachineBrand || 'N/A',
                customMachineModel: values.customMachineModel || 'N/A',
                customMachineManufacturer: values.customMachineManufacturer || 'N/A',
                customMachineName: selectedMachine?.name ?? '',
                description: values.description || undefined,
                justification: values.justification || undefined,
                comments: values.comments || undefined,
                suggestedSupplier: values.suggestedSupplier || undefined,
            };

            let targetId: string;

            if (isEdit) {
                await updateRequest({
                    variables: {
                        id: editId,
                        input: { id: editId, ...requestPayload },
                    },
                });
                targetId = editId!;

                // IDs de items que siguen en el formulario
                const currentDbIds = new Set(
                    values.items.map((item) => item.dbId).filter(Boolean),
                );

                // Eliminar los que estaban en BD pero ya no están en el formulario
                const removedIds = originalItemIdsRef.current.filter((id) => !currentDbIds.has(id));
                for (const itemId of removedIds) {
                    await removeItemFromRequest({
                        variables: { materialRequestMaterialId: itemId },
                    });
                }

                // Agregar solo los items nuevos (sin dbId)
                for (const item of values.items) {
                    if (item.dbId) continue; // ya existe en BD
                    const isFromMaterial = isMaterialCategory && item.catalogId && item.catalogId !== 'OTHER';
                    const isFromSparePart = isSparePartCategory && item.catalogId && item.catalogId !== 'OTHER';

                    await addItemToRequest({
                        variables: {
                            materialRequestId: targetId,
                            input: {
                                materialRequestId: targetId,
                                materialId: isFromMaterial ? item.catalogId : undefined,
                                sparePartId: isFromSparePart ? item.catalogId : undefined,
                                customName: item.customName || undefined,
                                brand: item.brand || undefined,
                                model: item.model || undefined,
                                partNumber: item.partNumber || undefined,
                                sku: item.sku || undefined,
                                unitOfMeasure: item.unitOfMeasure,
                                requestedQuantity: item.requestedQuantity,
                                proposedMaxStock: item.proposedMaxStock ?? undefined,
                                proposedMinStock: item.proposedMinStock ?? undefined,
                                isGenericAllowed: item.isGenericAllowed ?? false,
                            },
                        },
                    });
                }
            } else {
                const { data: createdData } = await createRequest({
                    variables: {
                        input: { ...requestPayload, items: [] },
                    },
                });
                targetId = createdData?.createMaterialRequest?.id as string;
                if (!targetId) throw new Error('No se pudo obtener el ID de la solicitud creada.');

                for (const item of values.items) {
                    const isFromMaterial = isMaterialCategory && item.catalogId && item.catalogId !== 'OTHER';
                    const isFromSparePart = isSparePartCategory && item.catalogId && item.catalogId !== 'OTHER';

                    await addItemToRequest({
                        variables: {
                            materialRequestId: targetId,
                            input: {
                                materialRequestId: targetId,
                                materialId: isFromMaterial ? item.catalogId : undefined,
                                sparePartId: isFromSparePart ? item.catalogId : undefined,
                                customName: item.customName || undefined,
                                brand: item.brand || undefined,
                                model: item.model || undefined,
                                partNumber: item.partNumber || undefined,
                                sku: item.sku || undefined,
                                unitOfMeasure: item.unitOfMeasure,
                                requestedQuantity: item.requestedQuantity,
                                proposedMaxStock: item.proposedMaxStock ?? undefined,
                                proposedMinStock: item.proposedMinStock ?? undefined,
                                isGenericAllowed: item.isGenericAllowed ?? false,
                            },
                        },
                    });
                }
            }

            navigate(`/solicitud-material/${targetId}`);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error al guardar la solicitud.';
            setGlobalError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const isLoading = formLoading || (isEdit && editLoading);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }


    return (
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="space-y-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(isEdit ? `/solicitud-material/${editId}` : '/solicitud-material')}
                    className="gap-1.5 -ml-2 text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isEdit ? 'Volver al detalle' : 'Solicitudes'}
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                    {isEdit ? 'Editar Solicitud' : 'Solicitud de refacciones, materiales y servicios'}
                </h1>
            </div>

            {globalError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    {/* ── 1. Información de la solicitud ── */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">1. Información de la solicitud</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                        {/* Solicitante: solo técnicos */}
                        <div className="space-y-1.5">
                            <Label>Solicitante <span className="text-destructive">*</span></Label>
                            <Controller
                                name="requesterId"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={technicians.map((t) => ({
                                            value: t.user.id,
                                            label: `${t.user.fullName}${t.position ? ` · ${t.position.name}` : ''}`,
                                        }))}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Selecciona el solicitante"
                                        searchPlaceholder="Buscar solicitante..."
                                    />
                                )}
                            />
                            {errors.requesterId && (
                                <p className="text-xs text-destructive">{errors.requesterId.message}</p>
                            )}
                        </div>

                        {/* ¿Qué solicita? */}
                        <div className="space-y-1.5">
                            <Label>¿Qué solicita? <span className="text-destructive">*</span></Label>
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

                        {/* Jefe a cargo: solo usuarios con rol BOSS */}
                        <div className="space-y-1.5">
                            <Label>Jefe a cargo <span className="text-destructive">*</span></Label>
                            <Controller
                                name="boss"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={bosses.map((b) => ({
                                            value: b.fullName,
                                            label: `${b.fullName}${b.employeeNumber ? ` · ${b.employeeNumber}` : ''}`,
                                        }))}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Selecciona el jefe responsable"
                                        searchPlaceholder="Buscar jefe..."
                                        emptyText="Sin jefes disponibles"
                                    />
                                )}
                            />
                            {errors.boss && (
                                <p className="text-xs text-destructive">{errors.boss.message}</p>
                            )}
                        </div>
                        </CardContent>
                    </Card>

                    {/* ── 2. Equipo o Estructura ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">2. Equipo o Estructura</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                        {/* Máquinas seleccionadas */}
                        <div className="space-y-1.5">
                            <Label>Máquina(s) / Equipo(s) <span className="text-destructive">*</span></Label>

                            {/* Lista de máquinas ya seleccionadas */}
                                {selectedMachines.length > 0 && (
                                <div className="space-y-1.5 mb-2">
                                    {selectedMachines.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-1.5 text-sm border border-border/50"
                                        >
                                            <span>{machineLabel(m)}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    const current = watchedMachineIds ?? [];
                                                    setValue('machineIds', current.filter((id: string) => id !== m.id), { shouldValidate: true });
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Combobox para agregar */}
                            <Combobox
                                options={machines
                                    .filter((m) => !(watchedMachineIds ?? []).includes(m.id))
                                    .map((m) => ({
                                        value: m.id,
                                        label: machineLabel(m),
                                    }))}
                                value=""
                                onValueChange={(val: string) => {
                                    if (val) {
                                        const current = watchedMachineIds ?? [];
                                        setValue('machineIds', [...current, val], { shouldValidate: true });
                                    }
                                }}
                                placeholder="Agregar máquina..."
                                searchPlaceholder="Buscar máquina..."
                            />
                            {errors.machineIds && (
                                <p className="text-xs text-destructive">{(errors.machineIds as unknown as { message?: string }).message ?? 'Selecciona al menos una máquina'}</p>
                            )}
                        </div>

                        {/* Área — derivada automáticamente de las máquinas */}
                        {selectedMachines.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs">Área (derivada del equipo)</Label>
                                <Input
                                    value={derivedAreaName}
                                    readOnly
                                    className="bg-muted/30 text-muted-foreground cursor-default"
                                />
                            </div>
                        )}

                        {/* Datos editables del equipo (solo si hay exactamente 1 máquina) */}
                        {selectedMachines.length === 1 && (
                            <div className="space-y-3 pt-1">
                                <p className="text-xs text-muted-foreground">
                                    Datos del equipo (editables — no afectan el catálogo original)
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Marca</Label>
                                        <Input
                                            className="h-9 text-sm"
                                            placeholder="N/A"
                                            {...register('customMachineBrand')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Modelo</Label>
                                        <Input
                                            className="h-9 text-sm"
                                            placeholder="N/A"
                                            {...register('customMachineModel')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Fabricante</Label>
                                        <Input
                                            className="h-9 text-sm"
                                            placeholder="N/A"
                                            {...register('customMachineManufacturer')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── 3. Artículos Solicitados — solo si NO es servicio ── */}
                {showItems && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">3. Artículos Solicitados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {isSKUCategory && (
                                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                                    Categoría SKU — artículos manuales requieren: marca, número de parte y stock mín/máx.
                                </div>
                            )}

                            <div className="space-y-3">
                                {fields.map((field, index) => {
                                    const isManual = watch(`items.${index}.isManual`);
                                    const catalogId = watch(`items.${index}.catalogId`);
                                    const isCatalogSelected = Boolean(catalogId && catalogId !== 'OTHER' && catalogId !== '');
                                    const refFieldsDisabled = Boolean(!isManual && isCatalogSelected);

                                    return (
                                        <div
                                            key={field.id}
                                            className="border border-border rounded-lg p-3 space-y-3 bg-muted/20"
                                        >
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
                                                    <Combobox
                                                        options={[
                                                            ...catalogItems.map((c) => ({
                                                                value: c.id,
                                                                label: c.label,
                                                            })),
                                                            { value: 'OTHER', label: 'Otro (ingreso manual)' },
                                                        ]}
                                                        value={catalogId || ''}
                                                        onValueChange={(val) => handleCatalogSelect(index, val)}
                                                        placeholder="Selecciona o elige Otro"
                                                        searchPlaceholder="Buscar..."
                                                        size="sm"
                                                        triggerClassName="text-xs"
                                                    />
                                                </div>
                                            )}

                                            {/* Nombre personalizado */}
                                            <div className="space-y-1">
                                                <Label className="text-xs">Nombre del artículo</Label>
                                                <Input
                                                    className="h-8 text-xs"
                                                    placeholder="Nombre o descripción del artículo"
                                                    {...register(`items.${index}.customName`)}
                                                />
                                            </div>

                                            {/* Campos de referencia */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Marca{isSKUCategory && isManual && <span className="text-destructive ml-0.5">*</span>}
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
                                                        No. Parte{isSKUCategory && isManual && <span className="text-destructive ml-0.5">*</span>}
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

                                            {/* Stock mín/máx — solo para SKU */}
                                            {isSKUCategory && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">
                                                            Stock Mín{isManual && <span className="text-destructive ml-0.5">*</span>}
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
                                                            Stock Máx{isManual && <span className="text-destructive ml-0.5">*</span>}
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

                                            {/* ¿Acepta genérico? */}
                                            <div className="space-y-1 pt-1">
                                                <Label className="text-xs">¿Puede ser genérico?</Label>
                                                <Controller
                                                    name={`items.${index}.isGenericAllowed`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex gap-4">
                                                            {([true, false] as const).map((val) => (
                                                                <label key={String(val)} className="flex items-center gap-1.5 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={field.value === val}
                                                                        onChange={() => field.onChange(val)}
                                                                        className="accent-primary h-3.5 w-3.5"
                                                                    />
                                                                    <span className="text-xs">{val ? 'Sí' : 'No'}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

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
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    {/* ── 4. Descripción / Especificaciones (por solicitud) ── */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                {showItems ? '4.' : '3.'} Descripción / Especificaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                rows={4}
                                placeholder="Describe las especificaciones o requerimientos de esta solicitud..."
                                {...register('description')}
                            />
                        </CardContent>
                    </Card>

                    {/* ── 5. Importancia y Compatibilidad ── */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                {showItems ? '5.' : '4.'} Importancia y Compatibilidad
                            </CardTitle>
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

                        </CardContent>
                    </Card>
                </div>

                {/* ── 6. Información Adicional ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {showItems ? '6.' : '5.'} Información Adicional
                        </CardTitle>
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
