import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';

import {
    GetFindingByIdDocument,
    UpdateFindingDocument,
    GetAreasDocument,
    GetShiftsDocument,
    GetMachinesPageDataDocument,
    AreaBasicFragmentDoc,
    MachineBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Abierto', className: 'bg-yellow-100 text-yellow-700' },
    CONVERTED_TO_WO: { label: 'Convertido a OT', className: 'bg-green-100 text-green-700' },
};

export default function FindingFeedbackPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: findingData, loading: findingLoading } = useQuery(GetFindingByIdDocument, {
        variables: { id: id! },
        skip: !id,
    });

    const { data: areasData } = useQuery(GetAreasDocument);
    const { data: shiftsData } = useQuery(GetShiftsDocument);
    const { data: machinesData } = useQuery(GetMachinesPageDataDocument);

    const [updateFinding, { loading: updating }] = useMutation(UpdateFindingDocument);

    const areas = useFragment(AreaBasicFragmentDoc, areasData?.areas ?? []);
    const machines = useFragment(MachineBasicFragmentDoc, machinesData?.machines ?? []);
    const shifts = shiftsData?.shiftsActive || [];

    const finding = findingData?.finding;

    const [form, setForm] = useState({
        areaId: '',
        shiftId: '',
        machineId: '',
        description: '',
        photoPath: '',
    });

    useEffect(() => {
        if (finding) {
            setForm({
                areaId: finding.area?.id || '',
                shiftId: finding.shift?.id || '',
                machineId: (finding as any).machineId || '',
                description: finding.description || '',
                photoPath: finding.photoPath || '',
            });
        }
    }, [finding]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.areaId || !form.shiftId || !form.description.trim()) {
            toast.error('Área, turno y descripción son obligatorios');
            return;
        }

        try {
            const input: any = {
                areaId: form.areaId,
                shiftId: form.shiftId,
                description: form.description.trim(),
                ...(form.machineId ? { machineId: form.machineId } : {}),
                ...(form.photoPath ? { photoPath: form.photoPath } : {}),
            };

            await updateFinding({ variables: { id: id!, input } });
            toast.success('Hallazgo actualizado correctamente');
            navigate(-1);
        } catch (err: any) {
            toast.error(err.message || 'Error al actualizar el hallazgo');
        }
    };

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

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Área *</Label>
                                <Select value={form.areaId} onValueChange={(v) => handleChange('areaId', v)}>
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
                                <Select value={form.shiftId} onValueChange={(v) => handleChange('shiftId', v)}>
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
                            <Label>Máquina Afectada (Opcional)</Label>
                            <Select
                                value={form.machineId || '__none__'}
                                onValueChange={(v) => handleChange('machineId', v === '__none__' ? '' : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin máquina asignada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Sin máquina</SelectItem>
                                    {machines.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name} [{m.code}]
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción *</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe el hallazgo..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ruta de Foto (Opcional)</Label>
                            <Input
                                value={form.photoPath}
                                onChange={(e) => handleChange('photoPath', e.target.value)}
                                placeholder="Ruta o URL de la evidencia fotográfica"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={updating}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updating} className="flex-1">
                                {updating
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                                    : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                                }
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
