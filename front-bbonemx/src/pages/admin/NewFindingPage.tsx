import React, { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import {
    GetAreasDocument,
    GetSubAreasByAreaDocument,
    GetShiftsDocument,
    GetMachinesDocument,
    CreateFindingDocument,
    AreaBasicFragmentDoc,
    SubAreaBasicFragmentDoc,
    MachineBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle, ImageIcon, Search } from 'lucide-react';

export default function NewFindingPage() {
    const navigate = useNavigate();

    const { data: areasData, loading: areasLoading } = useQuery(GetAreasDocument);
    const { data: shiftsData, loading: shiftsLoading } = useQuery(GetShiftsDocument);

    const [getSubAreas, { data: subAreasData }] = useLazyQuery(GetSubAreasByAreaDocument);
    const [getMachines, { data: machinesData }] = useLazyQuery(GetMachinesDocument);

    const [createFinding] = useMutation(CreateFindingDocument);

    const areas = useFragment(AreaBasicFragmentDoc, areasData?.areas ?? []);
    const subAreas = useFragment(SubAreaBasicFragmentDoc, subAreasData?.subAreasByArea || []);
    const shifts = shiftsData?.shiftsActive || [];

    const [form, setForm] = useState({
        areaId: '',
        subAreaId: '',
        machineId: '',
        shiftId: '',
        description: '',
    })

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ folio: string } | null>(null);
    const [formError, setFormError] = useState('');

    const availableMachines = useFragment(MachineBasicFragmentDoc, machinesData?.machinesActive?.filter(m => m.subAreaId === form.subAreaId) || []);

    const selectedArea = areas.find((a) => a.id === form.areaId);
    const isOperational = selectedArea?.type === 'OPERATIONAL';

    const handleChange = (field: string, value: string | undefined) => {
        setForm((prev) => ({ ...prev, [field]: value }));

        if (field === 'areaId') {
            setForm((prev) => ({ ...prev, subAreaId: '', machineId: '' }));
            const area = areas.find(a => a.id === value);
            if (area?.type === 'OPERATIONAL') {
                getSubAreas({ variables: { areaId: value! } });
                getMachines();
            }
        }
        if (field === 'subAreaId') {
            setForm((prev) => ({ ...prev, machineId: '' }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const isValid = form.areaId && form.description.trim() && form.shiftId || form.machineId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!isValid) return setFormError('Complete todos los campos obligatorios (Área, Turno, Máquina y Descripción)');
        setIsSubmitting(true);

        try {
            const photoPath = photoFile ? `uploads/findings/${Date.now()}_${photoFile.name}` : 'sin-foto.jpg';

            const { data } = await createFinding({
                variables: {
                    input: {
                        areaId: form.areaId,
                        machineId: form.machineId,
                        shiftId: form.shiftId,
                        description: form.description.trim(),
                        photoPath: photoPath 
                    },
                },
            });

            setSuccess({ folio: data?.createFinding.folio || 'N/A' });
            setTimeout(() => navigate('/hallazgos'), 2000);
        } catch (err: any) {
            console.error(err);
            setFormError(err.message || 'Error al registrar el hallazgo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Hallazgo registrado exitosamente</h3>
                    <p className="font-mono font-bold text-primary mt-2">Folio: {success.folio}</p>
                    <p className="text-sm text-muted-foreground mt-2">Redirigiendo al listado...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Registrar Nuevo Hallazgo</h1>
                    <p className="text-muted-foreground">Registre una anomalía detectada durante el recorrido</p>
                </div>
            </div>

            <Card className="bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-5 w-5 text-primary" /> Detalles del Hallazgo
                    </CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios según el sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                {formError}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Área *</Label>
                                <Select value={form.areaId} onValueChange={(v) => handleChange('areaId', v)}>
                                    <SelectTrigger><SelectValue placeholder={areasLoading ? 'Cargando...' : 'Seleccionar área'} /></SelectTrigger>
                                    <SelectContent>
                                        {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Turno del Reporte *</Label>
                                <Select value={form.shiftId} onValueChange={(v) => handleChange('shiftId', v)}>
                                    <SelectTrigger><SelectValue placeholder={shiftsLoading ? 'Cargando...' : 'Seleccionar turno'} /></SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {isOperational && (
                            <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-4 rounded-lg border border-border/50">
                                <div className="space-y-2">
                                    <Label>Sub-área (Opcional)</Label>
                                    <Select value={form.subAreaId} onValueChange={(v) => handleChange('subAreaId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar sub-área" /></SelectTrigger>
                                        <SelectContent>
                                            {subAreas.length > 0 ? subAreas.map((sa) => <SelectItem key={sa.id} value={sa.id}>{sa.name}</SelectItem>) : <SelectItem value="none" disabled>No hay subáreas</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-primary font-semibold">Máquina Afectada *</Label>
                                    <Select value={form.machineId} onValueChange={(v) => handleChange('machineId', v)} disabled={!form.subAreaId}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar máquina" /></SelectTrigger>
                                        <SelectContent>
                                            {availableMachines.length > 0 ? availableMachines.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} [{m.code}]</SelectItem>) : <SelectItem value="none" disabled>Seleccione una sub-área primero</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Descripción de la Anomalía / Hallazgo *</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Detalle exactamente qué problema se encontró..."
                                className="min-h-[100px]"
                            />
                        </div>

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

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={isSubmitting}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting || !isValid} className="flex-1">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Guardar Hallazgo</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
