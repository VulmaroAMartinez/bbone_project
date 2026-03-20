import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetDepartmentsDocument,
    ActivateDepartmentDocument,
    DeactivateDepartmentDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import DepartmentFormModal from './modals/DepartmentFormModal';

export default function DepartmentsPage() {
    const { data, loading, refetch } = useQuery(GetDepartmentsDocument, { fetchPolicy: 'cache-and-network' });

    const [activateDepartment] = useMutation(ActivateDepartmentDocument);
    const [deactivateDepartment] = useMutation(DeactivateDepartmentDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const departments = data?.departmentsWithDeleted || [];
    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openModal = (dept: any = null) => {
        setEditingItem(dept);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivateDepartment({ variables: { id } });
            else await activateDepartment({ variables: { id } });
            refetch();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Catálogo de Departamentos</h1>
                    <p className="text-muted-foreground">Estructura organizacional de la planta</p>
                </div>
                <Button onClick={() => openModal()} className="gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Departamento
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
                                    <th className="px-4 py-3 font-semibold">Departamento</th>
                                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Descripción</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                                ) : filteredDepartments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0 text-primary/70" /> <span className="truncate">{dept.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{dept.description || '--'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dept.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-muted-foreground hidden sm:inline">{dept.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(dept)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(dept.id, dept.isActive)}>
                                                {dept.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-success" />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <DepartmentFormModal
                open={isModalOpen}
                onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingItem(null); }}
                department={editingItem}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
