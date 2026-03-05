import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetMaterialsDocument,
    CreateMaterialDocument,
    UpdateMaterialDocument,
    ActivateMaterialDocument,
    DeactivateMaterialDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Power, PowerOff, Loader2 } from 'lucide-react';

const schema = yup.object({
    description: yup.string().trim().required('La descripción es obligatoria'),
    brand: yup.string().trim().default(''),
    manufacturer: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    partNumber: yup.string().trim().default(''),
    sku: yup.string().trim().default(''),
    unitOfMeasure: yup.string().trim().default(''),
});

type FormValues = yup.InferType<typeof schema>;

export default function MaterialsPage() {
    const { data, loading, refetch } = useQuery(GetMaterialsDocument, { fetchPolicy: 'cache-and-network' });

    const [createMaterial, { loading: creating }] = useMutation(CreateMaterialDocument);
    const [updateMaterial, { loading: updating }] = useMutation(UpdateMaterialDocument);
    const [activateMaterial] = useMutation(ActivateMaterialDocument);
    const [deactivateMaterial] = useMutation(DeactivateMaterialDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { description: '', brand: '', manufacturer: '', model: '', partNumber: '', sku: '', unitOfMeasure: '' },
    });

    const materials = data?.materialsWithDeleted || [];

    const filteredMaterials = materials.filter(m =>
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (material: any = null) => {
        if (material) {
            setEditingId(material.id);
            reset({
                description: material.description || '',
                brand: material.brand || '',
                manufacturer: material.manufacturer || '',
                model: material.model || '',
                partNumber: material.partNumber || '',
                sku: material.sku || '',
                unitOfMeasure: material.unitOfMeasure || '',
            });
        } else {
            setEditingId(null);
            reset({ description: '', brand: '', manufacturer: '', model: '', partNumber: '', sku: '', unitOfMeasure: '' });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: FormValues) => {
        try {
            if (editingId) {
                await updateMaterial({ variables: { id: editingId, input: { ...values } } });
            } else {
                await createMaterial({ variables: { input: { ...values } } });
            }
            setIsModalOpen(false);
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await deactivateMaterial({ variables: { id } });
            } else {
                await activateMaterial({ variables: { id } });
            }
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const isSaving = creating || updating;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Materiales</h1>
                    <p className="text-muted-foreground">Gestión de insumos y consumibles generales</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Material
                </Button>
            </div>

            <Card className="bg-card shadow-sm border-border">
                <CardHeader className="py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por descripción, SKU o # de parte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-y border-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Descripción</th>
                                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">SKU / # Parte</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Marca / Mod.</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">U. Medida</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredMaterials.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontraron materiales</td></tr>
                                ) : (
                                    filteredMaterials.map((mat) => (
                                        <tr key={mat.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{mat.description}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div className="flex flex-col">
                                                    {mat.sku && <span className="text-xs font-mono">SKU: {mat.sku}</span>}
                                                    {mat.partNumber && <span className="text-xs font-mono">PN: {mat.partNumber}</span>}
                                                    {!mat.sku && !mat.partNumber && <span className="text-xs text-muted-foreground">--</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {mat.brand || '--'} {mat.model && `(${mat.model})`}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">{mat.unitOfMeasure || '--'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${mat.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">{mat.isActive ? 'Activo' : 'Inactivo'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openModal(mat)} title="Editar">
                                                        <Edit2 className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => toggleStatus(mat.id, mat.isActive)}
                                                        title={mat.isActive ? "Desactivar" : "Activar"}
                                                    >
                                                        {mat.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Descripción *</Label>
                            <Input {...register('description')} placeholder="Ej: Aceite lubricante multiusos..." />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input {...register('sku')} />
                            </div>
                            <div className="space-y-2">
                                <Label>No. de Parte</Label>
                                <Input {...register('partNumber')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input {...register('brand')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input {...register('model')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fabricante</Label>
                                <Input {...register('manufacturer')} />
                            </div>
                            <div className="space-y-2">
                                <Label>U. de Medida</Label>
                                <Input {...register('unitOfMeasure')} placeholder="Ej: Lts, Pza, Cajas..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
