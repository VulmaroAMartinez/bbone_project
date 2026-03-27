import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetPositionsDocument,
    ActivatePositionDocument,
    DeactivatePositionDocument,
    type GetPositionsQuery,
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import PositionFormModal from './modals/PositionFormModal';

export default function PositionsPage() {
    const { data, loading, refetch } = useQuery<GetPositionsQuery>(GetPositionsDocument, { fetchPolicy: 'cache-and-network' });

    const [activatePosition] = useMutation(ActivatePositionDocument);
    const [deactivatePosition] = useMutation(DeactivatePositionDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    type PositionItem = GetPositionsQuery['positionsWithDeleted'][number];
    const [editingItem, setEditingItem] = useState<PositionItem | null>(null);

    const positions = data?.positionsWithDeleted || [];
    const PAGE_SIZE = 20;
    const filteredPositions = positions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const totalPages = Math.ceil(filteredPositions.length / PAGE_SIZE);
    const pagePositions = filteredPositions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openModal = (position: PositionItem | null = null) => {
        setEditingItem(position);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivatePosition({ variables: { id } });
            else await activatePosition({ variables: { id } });
            refetch();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado');
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
                        <Input placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9" />
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
                                ) : pagePositions.map((pos) => (
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
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPositions.length)} de {filteredPositions.length}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <PositionFormModal
                open={isModalOpen}
                onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingItem(null); }}
                position={editingItem}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
