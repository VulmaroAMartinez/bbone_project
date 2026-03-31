import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import {
    GetAreasDocument,
    GetShiftsDocument,
    CreateFindingDocument,
    type CreateFindingInput,
    AreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToBackend } from '@/lib/utils/uploads';
import { fileToBase64, enqueueTask, MAX_FILE_BYTES } from '@/lib/offline-sync';

export default function NewFindingPage() {
    const navigate = useNavigate();

    // ── Queries globales ──
    const { data: areasData, loading: areasLoading } = useQuery(GetAreasDocument);
    const { data: shiftsData, loading: shiftsLoading } = useQuery(GetShiftsDocument);
    const [createFinding] = useMutation(CreateFindingDocument);

    // ── Unmask fragments ──
    const areas = useFragment(AreaBasicFragmentDoc, areasData?.areas ?? []);
    const shifts = shiftsData?.shiftsActive || [];

    // ── Estado del formulario ──
    const [form, setForm] = useState({
        areaId: '',
        shiftId: '',
        description: '',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ folio: string } | null>(null);
    const [formError, setFormError] = useState('');

    // ── Validación: solo Área, Turno y Descripción son obligatorios ──
    const isValid = !!form.areaId && !!form.shiftId && form.description.trim().length > 0;

    // ── Handlers ──
    const handleChange = (field: string, value: string | undefined) => {
        setForm((prev) => ({ ...prev, [field]: value || '' }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_BYTES) {
            toast.error(`La imagen no puede superar ${MAX_FILE_BYTES / 1_048_576} MB`);
            e.target.value = '';
            return;
        }

        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.onerror = () => {
            reader.abort();
            toast.error('Error al leer el archivo de imagen');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!isValid) return setFormError('Complete los campos obligatorios: Área, Turno y Descripción');

        // ── Intercepción offline ───────────────────────────────────────────
        if (!navigator.onLine) {
            try {
                const photo = photoFile
                    ? {
                          base64: await fileToBase64(photoFile),
                          fileName: photoFile.name,
                          mimeType: photoFile.type,
                      }
                    : undefined;
                await enqueueTask({
                    type: 'CREATE_FINDING',
                    payload: {
                        areaId: form.areaId,
                        shiftId: form.shiftId,
                        description: form.description.trim(),
                        photo,
                    },
                });
                toast.success('Guardado sin conexión. Se sincronizará automáticamente.');
                navigate('/hallazgos');
            } catch {
                setFormError('No se pudo guardar el hallazgo localmente. Intente de nuevo.');
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // ── Subir foto real al backend (flujo online) ──────────────────
            const photoPath = photoFile
                ? (await uploadFileToBackend(photoFile)).url
                : 'sin-foto.jpg';

            const input: CreateFindingInput = {
                areaId: form.areaId,
                description: form.description.trim(),
                photoPath,
                shiftId: form.shiftId,
            };

            const { data } = await createFinding({
                variables: { input },
            });

            setSuccess({ folio: data?.createFinding.folio || 'N/A' });
            setTimeout(() => navigate('/hallazgos'), 2000);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Error al registrar el hallazgo');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render: Éxito ──
    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Hallazgo registrado exitosamente</h3>
                    <p className="text-sm text-muted-foreground mt-1">Folio: <strong>{success.folio}</strong></p>
                </div>
            </div>
        );
    }

    // ── Render: Formulario ──
    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Nuevo Hallazgo</h1>
                    <p className="text-muted-foreground">Registre anomalías o problemas encontrados</p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <PlusCircle className="h-5 w-5 text-primary" />
                        Datos del Hallazgo
                    </CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                {formError}
                            </div>
                        )}

                        {/* Fila: Área + Turno (obligatorios) */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-primary font-semibold">Área *</Label>
                                <Combobox
                                    options={areas.map((a) => ({ value: a.id, label: a.name }))}
                                    value={form.areaId}
                                    onValueChange={(v) => handleChange('areaId', v)}
                                    placeholder={areasLoading ? 'Cargando...' : 'Seleccionar área'}
                                    searchPlaceholder="Buscar área..."
                                    emptyText="Sin áreas"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-semibold">Turno *</Label>
                                <Select value={form.shiftId} onValueChange={(v) => handleChange('shiftId', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={shiftsLoading ? 'Cargando...' : 'Seleccionar turno'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label>Descripción de la Anomalía / Hallazgo *</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Detalle exactamente qué problema se encontró..."
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Foto */}
                        <div className="space-y-2">
                            <Label>Evidencia Fotográfica (Recomendada)</Label>
                            {photoPreview ? (
                                <div className="relative">
                                    <img src={photoPreview} alt="Vista previa" className="w-full h-48 object-cover rounded-lg border" />
                                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>
                                        Eliminar
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/10">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm font-medium">Capturar o subir foto del hallazgo</span>
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !isValid} className="flex-1">
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                                ) : (
                                    <><PlusCircle className="mr-2 h-4 w-4" /> Guardar Hallazgo</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
