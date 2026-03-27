import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import {
    GetTechniciansDataDocument,
    type GetTechniciansDataQuery,
    ActivateTechnicianDocument,
    DeactivateTechnicianDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Eye, Wrench, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

import TechnicianFormModal from './modals/TechnicianFormModal';
import { toast } from 'sonner';

export default function TecnicosPage() {
    const { data, loading, refetch } = useQuery<GetTechniciansDataQuery>(GetTechniciansDataDocument, { fetchPolicy: 'cache-and-network' });

    const [activateTechnician] = useMutation(ActivateTechnicianDocument);
    const [deactivateTechnician] = useMutation(DeactivateTechnicianDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    type TechnicianItem = GetTechniciansDataQuery['techniciansWithDeleted'][number];
    const [editingTech, setEditingTech] = useState<TechnicianItem | null>(null);

    const technicians = data?.techniciansWithDeleted || [];
    const departments = (data?.departmentsWithDeleted || []) as Array<{ id: string; name: string }>;
    const positions = (data?.positionsWithDeleted || []) as Array<{ id: string; name: string }>;
    const techRoleId = data?.rolesWithDeleted?.find(r => r.name === 'TECHNICIAN')?.id;

    const PAGE_SIZE = 20;
    const filteredTechnicians = technicians.filter(t =>
        t.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredTechnicians.length / PAGE_SIZE);
    const pageTechnicians = filteredTechnicians.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openModal = (tech: TechnicianItem | null = null) => {
        setEditingTech(tech || null);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivateTechnician({ variables: { id } });
            else await activateTechnician({ variables: { id } });
            refetch();
        } catch {
            toast.error('Error al actualizar el estado');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Técnicos</h1>
                    <p className="text-muted-foreground">Personal de mantenimiento operativo</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Registrar Técnico
                </Button>
            </div>

            <Card className="bg-card shadow-sm border-border">
                <CardHeader className="py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por Nombre o Número de Nómina..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Num. Nómina</th>
                                    <th className="px-4 py-3 font-semibold">Técnico</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Puesto</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Contacto</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredTechnicians.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontraron técnicos</td></tr>
                                ) : pageTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium text-primary">{tech.user.employeeNumber}</td>
                                        <td className="px-4 py-3 text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" /> <span className="truncate">{tech.user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{tech.position.name}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                {tech.user.email && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {tech.user.email}</span>}
                                                {tech.user.phone && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {tech.user.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-muted-foreground hidden sm:inline">{tech.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild title="Ver Detalles">
                                                    <Link to={`/tecnico/${tech.id}`}>
                                                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal(tech)} title="Editar">
                                                    <Edit2 className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => toggleStatus(tech.id, tech.isActive)} title={tech.isActive ? 'Desactivar' : 'Activar'}>
                                                    {tech.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
                                                </Button>
                                            </div>
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
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTechnicians.length)} de {filteredTechnicians.length}
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

            <TechnicianFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                technician={editingTech}
                departments={departments}
                positions={positions}
                techRoleId={techRoleId}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
