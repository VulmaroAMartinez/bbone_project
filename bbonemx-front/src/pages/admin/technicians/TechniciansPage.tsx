import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetTechniciansDataDocument,
    CreateUserDocument,
    UpdateUserDocument,
    CreateTechnicianProfileDocument,
    UpdateTechnicianProfileDocument,
    ActivateTechnicianDocument,
    DeactivateTechnicianDocument
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit2, Power, PowerOff, Loader2, Eye, Wrench, Mail, Phone } from 'lucide-react';

const createSchema = (isEditing: boolean) =>
    yup.object({
        firstName: yup.string().trim().required('El nombre es obligatorio'),
        lastName: yup.string().trim().required('Los apellidos son obligatorios'),
        employeeNumber: yup.string().trim().required('El número de nómina es obligatorio'),
        departmentId: yup.string().required('Seleccione un departamento'),
        email: yup.string().trim().email('Email no válido').default(''),
        phone: yup.string().trim().required('El teléfono es obligatorio'),
        password: isEditing
            ? yup.string().default('')
            : yup
                .string()
                .required('La contraseña es obligatoria')
                .min(8, 'Mínimo 8 caracteres'),
        positionId: yup.string().required('Seleccione un cargo'),
        address: yup.string().trim().required('La dirección es obligatoria'),
        allergies: yup.string().trim().required('Indique alergias o "Ninguna"'),
        birthDate: yup.string().required('La fecha de nacimiento es obligatoria'),
        bloodType: yup.string().trim().required('El tipo de sangre es obligatorio'),
        childrenCount: yup.number().min(0).required('Indique la cantidad de hijos').default(0),
        education: yup.string().trim().required('La escolaridad es obligatoria'),
        emergencyContactName: yup.string().trim().required('El nombre del contacto es obligatorio'),
        emergencyContactPhone: yup.string().trim().required('El teléfono de emergencia es obligatorio'),
        emergencyContactRelationship: yup.string().trim().required('El parentesco es obligatorio'),
        hireDate: yup.string().required('La fecha de contratación es obligatoria'),
        nss: yup.string().trim().default(''),
        pantsSize: yup.string().trim().required('La talla de pantalón es obligatoria'),
        rfc: yup.string().trim().default(''),
        shirtSize: yup.string().trim().required('La talla de camisa es obligatoria'),
        shoeSize: yup.string().trim().required('La talla de calzado es obligatoria'),
        transportRoute: yup.string().trim().required('La ruta de transporte es obligatoria'),
        vacationPeriod: yup.number().min(0).required('Indique el periodo vacacional actual').default(0),
        isBoss: yup.boolean().default(false),
    });

type FormValues = yup.InferType<ReturnType<typeof createSchema>>;

export default function TecnicosPage() {
    const { data, loading, refetch } = useQuery(GetTechniciansDataDocument, { fetchPolicy: 'cache-and-network' });

    const [createUser] = useMutation(CreateUserDocument);
    const [updateUser] = useMutation(UpdateUserDocument);
    const [createTechnician] = useMutation(CreateTechnicianProfileDocument);
    const [updateTechnician] = useMutation(UpdateTechnicianProfileDocument);
    const [activateTechnician] = useMutation(ActivateTechnicianDocument);
    const [deactivateTechnician] = useMutation(DeactivateTechnicianDocument);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTech, setEditingTech] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!editingTech;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(createSchema(isEditing)),
    });

    const technicians = data?.techniciansWithDeleted || [];
    const departments = data?.departmentsWithDeleted || [];
    const positions = data?.positionsWithDeleted || [];
    const techRoleId = data?.rolesWithDeleted?.find(r => r.name === 'TECHNICIAN')?.id;

    const filteredTechnicians = technicians.filter(t =>
        t.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (tech: any = null) => {
        if (tech) {
            setEditingTech(tech);
            const isBoss = tech.user.roles?.some((r: any) => r.name === 'BOSS') ?? false;

            reset({
                firstName: tech.user.firstName, lastName: tech.user.lastName, employeeNumber: tech.user.employeeNumber,
                departmentId: tech.user.departmentId, email: tech.user.email || '', phone: tech.user.phone || '', password: '',
                positionId: tech.position.id, address: tech.address, allergies: tech.allergies,
                birthDate: tech.birthDate.split('T')[0], bloodType: tech.bloodType, childrenCount: tech.childrenCount,
                education: tech.education, emergencyContactName: tech.emergencyContactName, emergencyContactPhone: tech.emergencyContactPhone,
                emergencyContactRelationship: tech.emergencyContactRelationship, hireDate: tech.hireDate.split('T')[0],
                nss: tech.nss || '', pantsSize: tech.pantsSize, rfc: tech.rfc || '', shirtSize: tech.shirtSize,
                shoeSize: tech.shoeSize, transportRoute: tech.transportRoute, vacationPeriod: tech.vacationPeriod,
                isBoss,
            });
        } else {
            setEditingTech(null);
            reset({
                firstName: '', lastName: '', employeeNumber: '', departmentId: '', email: '', phone: '', password: '',
                positionId: '', address: '', allergies: '', birthDate: '', bloodType: '', childrenCount: 0,
                education: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
                hireDate: '', nss: '', pantsSize: '', rfc: '', shirtSize: '', shoeSize: '', transportRoute: '', vacationPeriod: 0,
                isBoss: false,
            });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: FormValues) => {
        if (!techRoleId) return alert('No se encontró el rol TECHNICIAN en la base de datos.');
        setIsSaving(true);

        try {
            const userPayload: any = {
                firstName: values.firstName, lastName: values.lastName, employeeNumber: values.employeeNumber,
                departmentId: values.departmentId, email: values.email || undefined, phone: values.phone || undefined,
            };

            const techPayload = {
                positionId: values.positionId, address: values.address, allergies: values.allergies,
                birthDate: new Date(values.birthDate).toISOString(), bloodType: values.bloodType,
                childrenCount: Number(values.childrenCount), education: values.education,
                emergencyContactName: values.emergencyContactName, emergencyContactPhone: values.emergencyContactPhone,
                emergencyContactRelationship: values.emergencyContactRelationship, hireDate: new Date(values.hireDate).toISOString(),
                nss: values.nss || undefined, pantsSize: values.pantsSize, rfc: values.rfc || undefined,
                shirtSize: values.shirtSize, shoeSize: values.shoeSize, transportRoute: values.transportRoute,
                vacationPeriod: Number(values.vacationPeriod),
                isBoss: values.isBoss ?? false,
            };

            if (editingTech) {
                if (values.password) userPayload.password = values.password;
                await updateUser({ variables: { id: editingTech.user.id, input: userPayload } });
                await updateTechnician({ variables: { id: editingTech.id, input: { ...techPayload, id: editingTech.id } } });
            } else {
                if (!values.password) throw new Error("La contraseña es requerida para nuevos técnicos.");
                userPayload.password = values.password;
                userPayload.roleIds = [techRoleId];

                const userRes = await createUser({ variables: { input: userPayload } });
                const newUserId = userRes.data?.createUser.id;

                if (!newUserId) throw new Error("Error al generar el usuario.");

                await createTechnician({ variables: { input: { ...techPayload, userId: newUserId } } });
            }

            setIsModalOpen(false);
            refetch();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) await deactivateTechnician({ variables: { id } });
            else await activateTechnician({ variables: { id } });
            refetch();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const FieldError = ({ name }: { name: keyof FormValues }) => {
        const err = errors[name];
        return err ? <p className="text-xs text-destructive">{err.message}</p> : null;
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
                        <Input placeholder="Buscar por Nombre o Número de Nómina..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
                                ) : filteredTechnicians.map((tech) => (
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
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTech ? 'Editar Perfil del Técnico' : 'Registrar Nuevo Técnico'}</DialogTitle>
                        <DialogDescription>Complete la información personal y laboral del empleado.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
                        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">1. Credenciales y Sistema</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Nombre(s) *</Label><Input {...register('firstName')} /><FieldError name="firstName" /></div>
                                <div className="space-y-2"><Label>Apellidos *</Label><Input {...register('lastName')} /><FieldError name="lastName" /></div>
                                <div className="space-y-2"><Label>Número de Nómina *</Label><Input {...register('employeeNumber')} /><FieldError name="employeeNumber" /></div>
                                <div className="space-y-2">
                                    <Label>{editingTech ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}</Label>
                                    <Input type="password" {...register('password')} placeholder={editingTech ? 'Dejar vacío para no cambiar' : '••••••••'} />
                                    <FieldError name="password" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">2. Perfil Laboral</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Departamento *</Label>
                                    <Controller name="departmentId" control={control} render={({ field }) => (
                                        <Combobox
                                            options={departments.map((d: any) => ({ value: d.id, label: d.name }))}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Seleccionar departamento..."
                                            searchPlaceholder="Buscar..."
                                        />
                                    )} />
                                    <FieldError name="departmentId" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cargo / Puesto *</Label>
                                    <Controller name="positionId" control={control} render={({ field }) => (
                                        <Combobox
                                            options={positions.map((p: any) => ({ value: p.id, label: p.name }))}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Seleccionar cargo..."
                                            searchPlaceholder="Buscar..."
                                        />
                                    )} />
                                    <FieldError name="positionId" />
                                </div>
                                <div className="space-y-2"><Label>Fecha de Contratación *</Label><Input type="date" {...register('hireDate')} /><FieldError name="hireDate" /></div>
                                <div className="space-y-2"><Label>Periodo Vacacional *</Label><Input type="number" min="0" {...register('vacationPeriod')} /><FieldError name="vacationPeriod" /></div>
                                <div className="sm:col-span-2">
                                    <Controller name="isBoss" control={control} render={({ field }) => (
                                        <div className="flex items-center gap-2 pt-1">
                                            <Checkbox
                                                id="isBoss"
                                                checked={!!field.value}
                                                onCheckedChange={(checked) => field.onChange(!!checked)}
                                            />
                                            <Label htmlFor="isBoss" className="cursor-pointer font-normal">
                                                ¿Es jefe? (Selecciona solo si tiene técnicos a su cargo)
                                            </Label>
                                        </div>
                                    )} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">3. Información Personal</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Teléfono *</Label><Input {...register('phone')} /><FieldError name="phone" /></div>
                                <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email')} /><FieldError name="email" /></div>
                                <div className="space-y-2"><Label>Fecha Nacimiento *</Label><Input type="date" {...register('birthDate')} /><FieldError name="birthDate" /></div>

                                <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Dirección Completa *</Label><Input {...register('address')} /><FieldError name="address" /></div>

                                <div className="space-y-2"><Label>Tipo de Sangre *</Label><Input {...register('bloodType')} placeholder="Ej: O+" /><FieldError name="bloodType" /></div>
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2"><Label>Alergias *</Label><Input {...register('allergies')} placeholder="Ej: Ninguna, Penicilina..." /><FieldError name="allergies" /></div>

                                <div className="space-y-2"><Label>Hijos (Cantidad) *</Label><Input type="number" min="0" {...register('childrenCount')} /><FieldError name="childrenCount" /></div>
                                <div className="space-y-2"><Label>Escolaridad *</Label><Input {...register('education')} /><FieldError name="education" /></div>
                                <div className="space-y-2"><Label>Ruta de Transporte *</Label><Input {...register('transportRoute')} /><FieldError name="transportRoute" /></div>

                                <div className="space-y-2"><Label>NSS</Label><Input {...register('nss')} /></div>
                                <div className="space-y-2"><Label>RFC</Label><Input {...register('rfc')} /></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 rounded-lg border border-border">
                                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Contacto de Emergencia</h4>
                                <div className="space-y-2"><Label>Nombre *</Label><Input {...register('emergencyContactName')} /><FieldError name="emergencyContactName" /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-2"><Label>Teléfono *</Label><Input {...register('emergencyContactPhone')} /><FieldError name="emergencyContactPhone" /></div>
                                    <div className="space-y-2"><Label>Parentesco *</Label><Input {...register('emergencyContactRelationship')} /><FieldError name="emergencyContactRelationship" /></div>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 rounded-lg border border-border">
                                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Tallas de Uniforme</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-2"><Label>Camisa *</Label><Input {...register('shirtSize')} /><FieldError name="shirtSize" /></div>
                                    <div className="space-y-2"><Label>Pantalón *</Label><Input {...register('pantsSize')} /><FieldError name="pantsSize" /></div>
                                    <div className="space-y-2 sm:col-span-2"><Label>Calzado *</Label><Input {...register('shoeSize')} /><FieldError name="shoeSize" /></div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border sticky bottom-0 bg-background">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Guardar Técnico
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
