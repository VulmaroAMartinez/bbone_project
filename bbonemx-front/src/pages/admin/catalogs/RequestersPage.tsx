import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetRequestersDataDocument,
    ActivateUserDocument,
    DeactivateUserDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, UserRound, Mail, Phone } from 'lucide-react';
import RequesterFormModal from './modals/RequesterFormModal';

export default function RequestersPage() {
    const { data, loading, refetch } = useQuery(GetRequestersDataDocument, { fetchPolicy: 'cache-and-network' });

    const [activateUser] = useMutation(ActivateUserDocument);
    const [deactivateUser] = useMutation(DeactivateUserDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRequester, setEditingRequester] = useState<any | null>(null);

    const allUsers = data?.usersWithDeleted || [];
    const departments = data?.departmentsWithDeleted || [];
    const roles = data?.rolesWithDeleted || [];
    const requesterRoleId = roles.find(r => r.name === 'REQUESTER')?.id;

    const requesters = requesterRoleId
        ? allUsers.filter((u) => u.roleIds.includes(requesterRoleId))
        : [];

    const filteredRequesters = requesters.filter(r =>
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openModal = (user: any = null) => {
        setEditingRequester(user);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivateUser({ variables: { id } });
            else await activateUser({ variables: { id } });
            refetch();
        } catch (error: any) {
            alert(error.message);
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
                        <Input placeholder="Buscar por Nombre, Num. Empleado o Depto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
                                ) : filteredRequesters.map((req) => (
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
                                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(req.id, req.isActive)}>
                                                {req.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <RequesterFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                requester={editingRequester}
                requesterRoleId={requesterRoleId}
                departments={departments as Array<{ id: string; name: string }>}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
