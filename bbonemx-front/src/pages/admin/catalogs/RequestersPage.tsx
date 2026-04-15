import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import {
    GetRequestersDataDocument,
    ActivateUserDocument,
    DeactivateUserDocument,
    type GetRequestersDataQuery,
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, UserRound, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import RequesterFormModal from './modals/RequesterFormModal';
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

export default function RequestersPage() {
    const { data, loading, refetch } = useOfflineAwareQuery<GetRequestersDataQuery>(GetRequestersDataDocument);

    const [activateUser] = useMutation(ActivateUserDocument);
    const [deactivateUser] = useMutation(DeactivateUserDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    type RequesterItem = GetRequestersDataQuery['usersWithDeleted'][number];
    const [editingRequester, setEditingRequester] = useState<RequesterItem | null>(null);
    const [deactivatingRequester, setDeactivatingRequester] = useState<{ id: string; name: string } | null>(null);

    const allUsers = data?.usersWithDeleted || [];
    const departments = data?.departmentsWithDeleted || [];
    const roles = data?.rolesWithDeleted || [];
    const requesterRoleId = roles.find(r => r.name === 'REQUESTER')?.id;

    const requesters = requesterRoleId
        ? allUsers.filter((u) => u.roleIds.includes(requesterRoleId))
        : [];

    const PAGE_SIZE = 20;
    const filteredRequesters = requesters.filter(r =>
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const totalPages = Math.ceil(filteredRequesters.length / PAGE_SIZE);
    const pageRequesters = filteredRequesters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openModal = (user: RequesterItem | null = null) => {
        setEditingRequester(user);
        setIsModalOpen(true);
    };

    const toggleStatus = (id: string, currentStatus: boolean, name: string) => {
        if (currentStatus) {
            setDeactivatingRequester({ id, name });
        } else {
            activateUser({ variables: { id } })
                .then(() => { toast.success(`Solicitante "${name}" activado`); refetch(); })
                .catch(() => toast.error('Error al activar el solicitante'));
        }
    };

    const confirmDeactivate = async () => {
        if (!deactivatingRequester) return;
        try {
            await deactivateUser({ variables: { id: deactivatingRequester.id } });
            toast.success(`Solicitante "${deactivatingRequester.name}" desactivado`);
            refetch();
        } catch {
            toast.error('Error al desactivar el solicitante');
        } finally {
            setDeactivatingRequester(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Solicitantes</h1>
                    <p className="text-muted-foreground">Personal autorizado para reportar averías</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Registrar Solicitante
                </Button>
            </div>

            <Card className="bg-card shadow-sm border-border">
                <CardHeader className="py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por Nombre, Num. Empleado o Depto..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Num. Empleado</th>
                                    <th className="px-4 py-3 font-semibold">Nombre Completo</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Departamento</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Contacto</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredRequesters.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontraron solicitantes</td></tr>
                                ) : pageRequesters.map((req) => (
                                    <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium text-primary">{req.employeeNumber}</td>
                                        <td className="px-4 py-3 text-foreground">
                                            <div className="flex items-center gap-2">
                                                <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" /> <span className="truncate">{req.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{req.department?.name || '--'}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                {req.email && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {req.email}</span>}
                                                {req.phone && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {req.phone}</span>}
                                                {!req.email && !req.phone && <span className="text-xs text-muted-foreground italic">Sin contacto</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${req.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-muted-foreground hidden sm:inline">{req.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(req)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(req.id, req.isActive, req.fullName)}>
                                                {req.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
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
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRequesters.length)} de {filteredRequesters.length}
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

            <RequesterFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                requester={editingRequester}
                requesterRoleId={requesterRoleId}
                departments={departments as Array<{ id: string; name: string }>}
                onSuccess={() => refetch()}
            />

            <AlertDialog open={!!deactivatingRequester} onOpenChange={(open) => !open && setDeactivatingRequester(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar solicitante?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El solicitante <strong>{deactivatingRequester?.name}</strong> será marcado como inactivo y no podrá iniciar sesión. Podrás reactivarlo más tarde.
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
