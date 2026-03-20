import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetMaterialsDocument,
    ActivateMaterialDocument,
    DeactivateMaterialDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2 } from 'lucide-react';
import MaterialFormModal from './modals/MaterialFormModal';

export default function MaterialsPage() {
    const { data, loading, refetch } = useQuery(GetMaterialsDocument, { fetchPolicy: 'cache-and-network' });

    const [activateMaterial] = useMutation(ActivateMaterialDocument);
    const [deactivateMaterial] = useMutation(DeactivateMaterialDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

    const materials = data?.materialsWithDeleted || [];

    const filteredMaterials = materials.filter(m =>
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (material: any = null) => {
        setEditingMaterial(material);
        setIsModalOpen(true);
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

            <MaterialFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                material={editingMaterial}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
