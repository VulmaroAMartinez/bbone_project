import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetPositionsDocument,
    CreatePositionDocument,
    UpdatePositionDocument,
    ActivatePositionDocument,
    DeactivatePositionDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Briefcase } from 'lucide-react';

const schema = yup.object({
    name: yup.string().trim().required('El nombre es obligatorio'),
    description: yup.string().trim().default(''),
});

type FormValues = yup.InferType<typeof schema>;

export default function PositionsPage() {
    const { data, loading, refetch } = useQuery(GetPositionsDocument, { fetchPolicy: 'cache-and-network' });

    const [createPosition, { loading: creating }] = useMutation(CreatePositionDocument);
    const [updatePosition, { loading: updating }] = useMutation(UpdatePositionDocument);
    const [activatePosition] = useMutation(ActivatePositionDocument);
    const [deactivatePosition] = useMutation(DeactivatePositionDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    const positions = data?.positionsWithDeleted || [];
    const filteredPositions = positions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openModal = (position: any = null) => {
        if (position) {
            setEditingId(position.id);
            reset({ name: position.name, description: position.description || '' });
        } else {
            setEditingId(null);
            reset({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: FormValues) => {
        try {
            if (editingId) {
                await updatePosition({ variables: { id: editingId, input: { ...values } } });
            } else {
                await createPosition({ variables: { input: { ...values } } });
            }
            setIsModalOpen(false);
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivatePosition({ variables: { id } });
            else await activatePosition({ variables: { id } });
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Cargos</h1>
                    <p className="text-muted-foreground">Puestos y posiciones de los empleados</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Cargo
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
                                    <th className="px-4 py-3 font-semibold">Nombre del Cargo</th>
                                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Descripción</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredPositions.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 shrink-0 text-primary/70" /> <span className="truncate">{pos.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{pos.description || '--'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${pos.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-muted-foreground hidden sm:inline">{pos.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(pos)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(pos.id, pos.isActive)}>
                                                {pos.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
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
                        <DialogTitle>{editingId ? 'Editar Cargo' : 'Nuevo Cargo'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input {...register('name')} placeholder="Ej: Técnico Mecánico Nivel 2" />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input {...register('description')} placeholder="Opcional..." />
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
