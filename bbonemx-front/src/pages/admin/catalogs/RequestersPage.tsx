import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetRequestersDataDocument,
    CreateUserDocument,
    UpdateUserDocument,
    ActivateUserDocument,
    DeactivateUserDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, UserRound, Mail, Phone } from 'lucide-react';

const createSchema = (isEditing: boolean) =>
    yup.object({
        firstName: yup.string().trim().required('El nombre es obligatorio'),
        lastName: yup.string().trim().required('Los apellidos son obligatorios'),
        employeeNumber: yup.string().trim().required('El número de empleado es obligatorio'),
        departmentId: yup.string().required('Debe seleccionar un departamento'),
        email: yup.string().trim().email('Email no válido').default(''),
        phone: yup.string().trim().default(''),
        password: isEditing
            ? yup.string().default('')
            : yup.string().required('La contraseña inicial es obligatoria').min(6, 'Mínimo 6 caracteres'),
    });

type FormValues = yup.InferType<ReturnType<typeof createSchema>>;

export default function RequestersPage() {
    const { data, loading, refetch } = useQuery(GetRequestersDataDocument, { fetchPolicy: 'cache-and-network' });

    const [createUser, { loading: creating }] = useMutation(CreateUserDocument);
    const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument);
    const [activateUser] = useMutation(ActivateUserDocument);
    const [deactivateUser] = useMutation(DeactivateUserDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const isEditing = !!editingId;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(createSchema(isEditing)),
        defaultValues: { employeeNumber: '', firstName: '', lastName: '', departmentId: '', email: '', phone: '', password: '' },
    });

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
        if (user) {
            setEditingId(user.id);
            reset({
                employeeNumber: user.employeeNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                departmentId: user.department.id,
                email: user.email || '',
                phone: user.phone || '',
                password: ''
            });
        } else {
            setEditingId(null);
            reset({ employeeNumber: '', firstName: '', lastName: '', departmentId: '', email: '', phone: '', password: '' });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: FormValues) => {
        if (!requesterRoleId) {
            return alert('Error de configuración: No se encontró el rol "REQUESTER" en el sistema.');
        }

        try {
            const input: any = {
                firstName: values.firstName,
                lastName: values.lastName,
                employeeNumber: values.employeeNumber,
                departmentId: values.departmentId,
                email: values.email || undefined,
                phone: values.phone || undefined,
            };

            if (editingId) {
                if (values.password?.trim()) input.password = values.password;
                await updateUser({ variables: { id: editingId, input } });
            } else {
                input.password = values.password;
                input.roleIds = [requesterRoleId];
                await createUser({ variables: { input } });
            }

            setIsModalOpen(false);
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Solicitante' : 'Nuevo Solicitante'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre(s) *</Label>
                                <Input {...register('firstName')} placeholder="Ej: Juan" />
                                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos *</Label>
                                <Input {...register('lastName')} placeholder="Ej: Pérez" />
                                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Número de Empleado *</Label>
                                <Input {...register('employeeNumber')} placeholder="Ej: EMP-1050" />
                                {errors.employeeNumber && <p className="text-xs text-destructive">{errors.employeeNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Departamento *</Label>
                                <Controller
                                    name="departmentId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                            <SelectContent>
                                                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email (Opcional)</Label>
                                <Input type="email" {...register('email')} placeholder="correo@empresa.com" />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono (Opcional)</Label>
                                <Input type="tel" {...register('phone')} placeholder="10 dígitos" />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border">
                            <Label>{editingId ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial *'}</Label>
                            <Input
                                type="password"
                                {...register('password')}
                                placeholder={editingId ? 'Dejar en blanco para no cambiar' : '••••••••'}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            {editingId && <p className="text-xs text-muted-foreground">Si no desea cambiar la contraseña del usuario, deje este campo vacío.</p>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={creating || updating}>
                                {(creating || updating) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Guardar Solicitante
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
