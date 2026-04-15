import { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import {
    GetSparePartsDocument,
    ActivateSparePartDocument,
    DeactivateSparePartDocument,
    MachineBasicFragmentDoc,
    type GetSparePartsQuery,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';

import SparePartFormModal from './modals/SparePartFormModal';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SparePartsPage() {
    const { data, loading, refetch } = useOfflineAwareQuery<GetSparePartsQuery>(GetSparePartsDocument);

    const [activateSparePart] = useMutation(ActivateSparePartDocument);
    const [deactivateSparePart] = useMutation(DeactivateSparePartDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingSparePart, setEditingSparePart] = useState<any>(null);
    const [deactivatingPart, setDeactivatingPart] = useState<{ id: string; name: string } | null>(null);

    const rawSpareParts = useMemo(() => data?.sparePartsWithDeleted ?? [], [data?.sparePartsWithDeleted]);

    const spareParts = useMemo(
        () =>
            rawSpareParts.map((p) => ({
                ...p,
                machine: unmaskFragment(MachineBasicFragmentDoc, p.machine),
            })),
        [rawSpareParts],
    );

    const PAGE_SIZE = 20;
    const filteredParts = spareParts.filter((p) =>
        p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    const totalPages = Math.ceil(filteredParts.length / PAGE_SIZE);
    const pageParts = filteredParts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openModal = (part: any = null) => {
        setEditingSparePart(part);
        setIsModalOpen(true);
    };

    const toggleStatus = (id: string, currentStatus: boolean, name: string) => {
        if (currentStatus) {
            setDeactivatingPart({ id, name });
        } else {
            activateSparePart({ variables: { id } })
                .then(() => { toast.success(`Refacción "${name}" activada`); refetch(); })
                .catch(() => toast.error('Error al activar la refacción'));
        }
    };

    const confirmDeactivate = async () => {
        if (!deactivatingPart) return;
        try {
            await deactivateSparePart({ variables: { id: deactivatingPart.id } });
            toast.success(`Refacción "${deactivatingPart.name}" desactivada`);
            refetch();
        } catch {
            toast.error('Error al desactivar la refacción');
        } finally {
            setDeactivatingPart(null);
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
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
                                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">SKU</th>
                                    <th className="px-4 py-3 font-semibold">Máquina</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Marca / Modelo</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Inventario</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Costo / Total</th>
                                    <th className="px-4 py-3 font-semibold hidden xl:table-cell">Proveedor</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={9} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredParts.length === 0 ? (
                                    <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No se encontraron refacciones</td></tr>
                                ) : (
                                    pageParts.map((part) => (
                                        <tr key={part.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">{part.partNumber}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">{(part as unknown as { sku?: string }).sku || '--'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <Wrench className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="font-semibold truncate">{part.machine?.name ?? '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {part.brand || '--'} {part.model && `(${part.model})`}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                                                {part.cantidad != null
                                                  ? Number(part.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                                  : '—'}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                                                {part.costo != null || part.precioTotal != null
                                                  ? [
                                                      part.costo != null
                                                        ? Number(part.costo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                                                        : '—',
                                                      part.precioTotal != null
                                                        ? Number(part.precioTotal).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                                                        : '—',
                                                    ].join(' / ')
                                                  : '—'}
                                            </td>
                                            <td className="px-4 py-3 hidden xl:table-cell">{part.supplier || '--'}</td>
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
                                                        onClick={() => toggleStatus(part.id, part.isActive, part.partNumber)}
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
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredParts.length)} de {filteredParts.length}
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

            <SparePartFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                sparePart={editingSparePart}
                onSuccess={() => refetch()}
            />

            <AlertDialog open={!!deactivatingPart} onOpenChange={(open) => !open && setDeactivatingPart(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar refacción?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La refacción <strong>{deactivatingPart?.name}</strong> será marcada como inactiva. Podrás reactivarla más tarde.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive text-white hover:bg-destructive/90">
                            Desactivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
