import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetSparePartsDocument,
    ActivateSparePartDocument,
    DeactivateSparePartDocument,
    MachineBasicFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Wrench } from 'lucide-react';

import SparePartFormModal from './modals/SparePartFormModal';

export default function SparePartsPage() {
    const { data, loading, refetch } = useQuery(GetSparePartsDocument, { fetchPolicy: 'cache-and-network' });

    const [activateSparePart] = useMutation(ActivateSparePartDocument);
    const [deactivateSparePart] = useMutation(DeactivateSparePartDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSparePart, setEditingSparePart] = useState<any | null>(null);

    const rawSpareParts = data?.sparePartsWithDeleted || [];
    const unmask = useFragment;
    const spareParts = useMemo(() =>
        rawSpareParts.map(p => ({
            ...p,
            machine: unmask(MachineBasicFragmentDoc, p.machine),
        })),
        [rawSpareParts, unmask]
    );

    const filteredParts = spareParts.filter(p =>
        p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (part: any = null) => {
        setEditingSparePart(part);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await deactivateSparePart({ variables: { id } });
            } else {
                await activateSparePart({ variables: { id } });
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
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Refacciones</h1>
                    <p className="text-muted-foreground">Piezas y repuestos específicos por máquina</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Nueva Refacción
                </Button>
            </div>

            <Card className="bg-card shadow-sm border-border">
                <CardHeader className="py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por # Parte, Máquina o Marca..."
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
                                    <th className="px-4 py-3 font-semibold">No. Parte</th>
                                    <th className="px-4 py-3 font-semibold">Máquina</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Marca / Modelo</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Proveedor</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredParts.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontraron refacciones</td></tr>
                                ) : (
                                    filteredParts.map((part) => (
                                        <tr key={part.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">{part.partNumber}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <Wrench className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="font-semibold truncate">{part.machine.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {part.brand || '--'} {part.model && `(${part.model})`}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">{part.supplier || '--'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${part.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">{part.isActive ? 'Activo' : 'Inactivo'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openModal(part)} title="Editar">
                                                        <Edit2 className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => toggleStatus(part.id, part.isActive)}
                                                        title={part.isActive ? "Desactivar" : "Activar"}
                                                    >
                                                        {part.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
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

            <SparePartFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                sparePart={editingSparePart}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
