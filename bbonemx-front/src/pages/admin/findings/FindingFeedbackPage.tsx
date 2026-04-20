import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';

import {
    GetFindingByIdDocument,
    UpdateFindingDocument,
    AddFindingPhotoDocument,
    RemoveFindingPhotoDocument,
    GetAreasDocument,
    GetShiftsDocument,
    GetMachinesPageDataDocument,
    AreaBasicFragmentDoc,
    MachineBasicFragmentDoc,
    FindingBasicFragmentDoc,
    FindingPhotoBasicFragmentDoc,
    type FindingPhotoBasicFragment,
    type GetMachinesPageDataQuery,
    type UpdateFindingInput,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { canEditFinding, filterMachinesByArea, buildMachineLabel } from '@/lib/findings/finding-logic';
import { resolveBackendAssetUrl, uploadFileToBackend } from '@/lib/utils/uploads';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle2, ImageIcon, X, Plus } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Abierto', className: 'bg-yellow-100 text-yellow-700' },
    CONVERTED_TO_WO: { label: 'Convertido a OT', className: 'bg-green-100 text-green-700' },
};

function PhotoLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
    return (
        <Dialog open={!!src} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center bg-black/90 border-0">
                {src && (
                    <img
                        src={src}
                        alt="Vista ampliada"
                        className="max-h-[85vh] max-w-[86vw] object-contain rounded"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function AdditionalPhotos({
    findingId,
    photos,
    isReadOnly,
    onPhotoClick,
    refetchFinding,
}: {
    findingId: string;
    photos: Array<{ id: string; filePath: string; fileName: string; mimeType: string }>;
    isReadOnly: boolean;
    onPhotoClick: (src: string) => void;
    refetchFinding: () => void;
}) {
    const [uploading, setUploading] = useState(false);

    const [addPhoto] = useMutation(AddFindingPhotoDocument);
    const [removePhoto] = useMutation(RemoveFindingPhotoDocument);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_PHOTO_BYTES) {
            toast.error('La imagen no puede superar 5 MB');
            return;
        }
        try {
            setUploading(true);
            const uploaded = await uploadFileToBackend(file);
            await addPhoto({
                variables: {
                    findingId,
                    filePath: uploaded.url,
                    fileName: file.name,
                    mimeType: file.type,
                },
            });
            refetchFinding();
            toast.success('Foto agregada');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removePhoto({ variables: { id } });
            refetchFinding();
            toast.success('Foto eliminada');
        } catch {
            toast.error('Error al eliminar la foto');
        }
    };

    if (photos.length === 0 && isReadOnly) return null;

    return (
        <div className="space-y-3">
            <Label>Fotos Adicionales</Label>
            <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                        <img
                            src={resolveBackendAssetUrl(photo.filePath)}
                            alt={photo.fileName}
                            className="w-full h-full object-cover rounded-lg border cursor-pointer"
                            onClick={() => onPhotoClick(resolveBackendAssetUrl(photo.filePath))}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {!isReadOnly && (
                            <button
                                type="button"
                                onClick={() => handleRemove(photo.id)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                ))}
                {!isReadOnly && (
                    <label className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-muted/10 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploading
                            ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            : <Plus className="h-5 w-5 text-muted-foreground" />
                        }
                        <span className="text-xs text-muted-foreground">
                            {uploading ? 'Subiendo...' : 'Agregar'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    </label>
                )}
            </div>
        </div>
    );
}

function FindingFeedbackForm({
    finding,
    areas,
    shifts,
    machines,
    updating,
    isReadOnly,
    onSubmitUpdate,
    onPhotoClick,
}: {
    finding: unknown;
    areas: Array<{ id: string; name: string }>;
    shifts: Array<{ id: string; name: string }>;
    machines: Array<{ id: string; name: string; code?: string | null }>;
    updating: boolean;
    isReadOnly: boolean;
    onSubmitUpdate: (input: UpdateFindingInput) => Promise<void>;
    onPhotoClick: (src: string) => void;
}) {
    const navigate = useNavigate();

    const machineIdInitial = (finding as unknown as { machineId?: string | null } | null)?.machineId ?? '';

    const [form, setForm] = useState(() => ({
        areaId: (finding as unknown as { area?: { id?: string | null } | null })?.area?.id || '',
        shiftId: (finding as unknown as { shift?: { id?: string | null } | null })?.shift?.id || '',
        machineId: machineIdInitial || '',
        description: (finding as unknown as { description?: string | null })?.description || '',
        photoPath: (finding as unknown as { photoPath?: string | null })?.photoPath || '',
    }));

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_PHOTO_BYTES) {
            toast.error('La imagen no puede superar 5 MB');
            e.target.value = '';
            return;
        }
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!form.areaId || !form.shiftId || !form.description.trim()) {
            toast.error('Área, turno y descripción son obligatorios');
            return;
        }

        try {
            let resolvedPhotoPath = form.photoPath;

            if (photoFile) {
                setUploading(true);
                try {
                    const uploaded = await uploadFileToBackend(photoFile);
                    resolvedPhotoPath = uploaded.url;
                } finally {
                    setUploading(false);
                }
            }

            const input: UpdateFindingInput = {
                areaId: form.areaId,
                shiftId: form.shiftId,
                description: form.description.trim(),
                ...(form.machineId ? { machineId: form.machineId } : {}),
                ...(resolvedPhotoPath ? { photoPath: resolvedPhotoPath } : {}),
            };

            await onSubmitUpdate(input);
            toast.success('Hallazgo actualizado correctamente');
            navigate(-1);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al actualizar el hallazgo');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Área *</Label>
                    <Select
                        value={form.areaId}
                        onValueChange={(v) => handleChange('areaId', v)}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                        <SelectContent>
                            {areas.map((a) => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Turno *</Label>
                    <Select
                        value={form.shiftId}
                        onValueChange={(v) => handleChange('shiftId', v)}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar turno" />
                        </SelectTrigger>
                        <SelectContent>
                            {shifts.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Equipo/Estructura Afectado (Opcional)</Label>
                <Combobox
                    options={[{ value: '__none__', label: 'Sin equipo' }, ...machines.map((m) => ({ value: m.id, label: buildMachineLabel(m) }))]}
                    value={form.machineId || '__none__'}
                    onValueChange={(v) => handleChange('machineId', v === '__none__' ? '' : v)}
                    placeholder="Sin equipo asignado"
                    searchPlaceholder="Buscar equipo/estructura..."
                    emptyText="Sin equipos"
                    disabled={isReadOnly}
                />
            </div>

            <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe el hallazgo..."
                    className="min-h-[100px]"
                    disabled={isReadOnly}
                />
            </div>

            <div className="space-y-2">
                <Label>Foto Principal (Opcional)</Label>
                {photoPreview ? (
                    <div className="relative">
                        <img
                            src={photoPreview}
                            alt="Vista previa"
                            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                            onClick={() => onPhotoClick(photoPreview)}
                        />
                        {!isReadOnly && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                            >
                                Cambiar
                            </Button>
                        )}
                    </div>
                ) : form.photoPath ? (
                    <div className="relative">
                        <img
                            src={resolveBackendAssetUrl(form.photoPath)}
                            alt="Foto del hallazgo"
                            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                            onClick={() => onPhotoClick(resolveBackendAssetUrl(form.photoPath))}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {!isReadOnly && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => handleChange('photoPath', '')}
                            >
                                Cambiar
                            </Button>
                        )}
                    </div>
                ) : !isReadOnly ? (
                    <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/10">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Capturar o subir foto principal</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Sin foto registrada</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={updating || uploading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={updating || uploading || isReadOnly} className="flex-1">
                    {uploading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo foto...</>
                        : updating
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                        : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                    }
                </Button>
            </div>
        </form>
    );
}

export default function FindingFeedbackPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    const { data: findingData, loading: findingLoading, refetch: refetchFinding } = useQuery(GetFindingByIdDocument, {
        variables: { id: id! },
        skip: !id,
    });

    const { data: areasData } = useQuery(GetAreasDocument);
    const { data: shiftsData } = useQuery(GetShiftsDocument);
    const { data: machinesData } = useQuery<GetMachinesPageDataQuery>(GetMachinesPageDataDocument);

    const [updateFinding, { loading: updating }] = useMutation(UpdateFindingDocument);

    const areas = useFragment(AreaBasicFragmentDoc, areasData?.areas ?? []);
    const machineRefs = machinesData?.machinesWithDeleted ?? [];
    const machines = useFragment(MachineBasicFragmentDoc, machineRefs);
    const shifts = shiftsData?.shiftsActive || [];

    const findingRef = findingData?.finding ?? null;
    const finding = useFragment(FindingBasicFragmentDoc, findingRef);

    type PhotoRef = { readonly ' $fragmentRefs'?: { FindingPhotoBasicFragment: FindingPhotoBasicFragment } };
    const photosRaw = ((finding as unknown as { photos?: PhotoRef[] | null })?.photos ?? []) as readonly PhotoRef[];
    const photos = useFragment(FindingPhotoBasicFragmentDoc, photosRaw);

    if (findingLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4 pb-12">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!finding) {
        return (
            <div className="max-w-2xl mx-auto space-y-4 pb-12">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" /> Volver
                </Button>
                <p className="text-muted-foreground">Hallazgo no encontrado.</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[finding.status] ?? STATUS_CONFIG.OPEN;
    const isReadOnly = !canEditFinding(
        (finding as unknown as { convertedToWo?: { folio: string } | null }).convertedToWo,
    ) || finding.status === 'CONVERTED_TO_WO';

    const findingAreaId =
        (finding as unknown as { area?: { id?: string | null } | null })?.area?.id ?? '';
    const filteredMachines = filterMachinesByArea(
        machines as unknown as Array<{
            id: string;
            area?: { id: string; name: string } | null;
            subArea?: { id: string; name: string; area?: { id: string; name: string } | null } | null;
        }>,
        findingAreaId,
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold text-foreground">Retroalimentación</h1>
                        <span className="font-mono text-sm text-primary">{finding.folio}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                            {finding.status === 'OPEN'
                                ? <AlertTriangle className="h-3.5 w-3.5" />
                                : <CheckCircle2 className="h-3.5 w-3.5" />
                            }
                            {statusCfg.label}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Actualiza los datos del hallazgo</p>
                </div>
            </div>

            {finding.convertedToWo && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-700">
                        Convertido a OT: <Badge variant="secondary" className="ml-1">{finding.convertedToWo.folio}</Badge>
                    </p>
                </div>
            )}

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Datos del Hallazgo</CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <FindingFeedbackForm
                        key={finding.id}
                        finding={finding as unknown as NonNullable<ReturnType<typeof useParams<{ id: string }>>>}
                        areas={areas}
                        shifts={shifts}
                        machines={filteredMachines as unknown as Array<{ id: string; name: string; code?: string | null }>}
                        updating={updating}
                        isReadOnly={isReadOnly}
                        onSubmitUpdate={(input) => updateFinding({ variables: { id: id!, input } }).then(() => undefined)}
                        onPhotoClick={setLightboxSrc}
                    />
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground text-base">Evidencia Fotográfica Adicional</CardTitle>
                    <CardDescription>Máximo 5 MB por foto</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdditionalPhotos
                        findingId={id!}
                        photos={photos as unknown as Array<{ id: string; filePath: string; fileName: string; mimeType: string }>}
                        isReadOnly={isReadOnly}
                        onPhotoClick={setLightboxSrc}
                        refetchFinding={refetchFinding}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
