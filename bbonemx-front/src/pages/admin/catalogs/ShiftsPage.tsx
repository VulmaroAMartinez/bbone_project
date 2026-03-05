import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetShiftsAllDocument,
    CreateShiftDocument,
    UpdateShiftDocument,
    ActivateShiftDocument,
    DeactivateShiftDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, ClockPlus, Edit2, Power, PowerOff, Loader2, Clock } from 'lucide-react';

const schema = yup.object({
    name: yup.string().trim().required('El nombre es obligatorio'),
    startTime: yup.string().required('La hora de inicio es obligatoria'),
    endTime: yup.string().required('La hora de fin es obligatoria'),
});

type FormValues = yup.InferType<typeof schema>;

export default function ShiftsPage() {
    const { data, loading, refetch } = useQuery(GetShiftsAllDocument, { fetchPolicy: 'cache-and-network' });

    const [createShift, { loading: creating }] = useMutation(CreateShiftDocument);
    const [updateShift, { loading: updating }] = useMutation(UpdateShiftDocument);
    const [activateShift] = useMutation(ActivateShiftDocument);
    const [deactivateShift] = useMutation(DeactivateShiftDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', startTime: '07:00', endTime: '15:00' },
    });

    const shifts = data?.shiftsWithDeleted || [];
    const filteredShifts = shifts.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const openModal = (shift: any = null) => {
        if (shift) {
            setEditingId(shift.id);
            reset({
                name: shift.name,
                startTime: shift.startTime.slice(0, 5),
                endTime: shift.endTime.slice(0, 5)
            });
        } else {
            setEditingId(null);
            reset({ name: '', startTime: '07:00', endTime: '15:00' });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: FormValues) => {
        const payload = {
            name: values.name,
            startTime: values.startTime.length === 5 ? `${values.startTime}:00` : values.startTime,
            endTime: values.endTime.length === 5 ? `${values.endTime}:00` : values.endTime
        };

        try {
            if (editingId) {
                await updateShift({ variables: { id: editingId, input: payload } });
            } else {
                await createShift({ variables: { input: payload } });
            }
            setIsModalOpen(false);
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivateShift({ variables: { id } });
            else await activateShift({ variables: { id } });
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Turnos</h1>
                    <p className="text-muted-foreground">Configuración de horarios laborales</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <ClockPlus className="h-4 w-4" /> Nuevo Turno
                </Button>
            </div>

            <Card className="bg-card shadow-sm border-border">
                <CardHeader className="py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Nombre del Turno</th>
                                    <th className="px-4 py-3 font-semibold">Hora Inicio</th>
                                    <th className="px-4 py-3 font-semibold">Hora Fin</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredShifts.map((sh) => (
                                    <tr key={sh.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground capitalize">{sh.name}</td>
                                        <td className="px-4 py-3 font-mono"><Clock className="inline h-3 w-3 mr-1 text-muted-foreground" /> {sh.startTime.slice(0, 5)}</td>
                                        <td className="px-4 py-3 font-mono"><Clock className="inline h-3 w-3 mr-1 text-muted-foreground" /> {sh.endTime.slice(0, 5)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${sh.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-muted-foreground hidden sm:inline">{sh.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(sh)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(sh.id, sh.isActive)}>
                                                {sh.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Turno' : 'Nuevo Turno'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre del Turno *</Label>
                            <Input {...register('name')} placeholder="Ej: Matutino, Vespertino..." />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hora Inicio *</Label>
                                <Input type="time" {...register('startTime')} />
                                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Hora Fin *</Label>
                                <Input type="time" {...register('endTime')} />
                                {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={creating || updating}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
