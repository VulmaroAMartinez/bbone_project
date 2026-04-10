import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import {
    CreateUserDocument,
    UpdateUserDocument,
    CreateTechnicianProfileDocument,
    UpdateTechnicianProfileDocument,
    type CreateUserInput,
    type UpdateUserInput,
    type GetTechniciansDataQuery,
} from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// ---------------------------------------------------------------------------
// Schema & types
// ---------------------------------------------------------------------------

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
        vacationPeriod: isEditing
            ? yup.number().min(0).required('Indique el periodo vacacional actual').default(0)
            : yup.number().optional().default(undefined),
        isBoss: yup.boolean().default(false),
    });

type FormValues = yup.InferType<ReturnType<typeof createSchema>>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TechnicianFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    technician: GetTechniciansDataQuery['techniciansWithDeleted'][number] | null;
    departments: Array<{ id: string; name: string }>;
    positions: Array<{ id: string; name: string }>;
    techRoleId: string | undefined;
    onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TechnicianFormModal({
    open,
    onOpenChange,
    technician,
    departments,
    positions,
    techRoleId,
    onSuccess,
}: TechnicianFormModalProps) {
    const isEditing = !!technician;

    const [createUser] = useMutation(CreateUserDocument);
    const [updateUser] = useMutation(UpdateUserDocument);
    const [createTechnician] = useMutation(CreateTechnicianProfileDocument);
    const [updateTechnician] = useMutation(UpdateTechnicianProfileDocument);

    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(createSchema(isEditing)) as any,
    });

    // Reset form when technician prop changes (populate for edit, clear for create)
    useEffect(() => {
        if (!open) return;

        if (technician) {
            const isBoss = technician.user.roles?.some((r: { name: string }) => r.name === 'BOSS') ?? false;
            reset({
                firstName: technician.user.firstName,
                lastName: technician.user.lastName,
                employeeNumber: technician.user.employeeNumber,
                departmentId: technician.user.departmentId,
                email: technician.user.email || '',
                phone: technician.user.phone || '',
                password: '',
                positionId: technician.position.id,
                address: technician.address,
                allergies: technician.allergies,
                birthDate: technician.birthDate.split('T')[0],
                bloodType: technician.bloodType,
                childrenCount: technician.childrenCount,
                education: technician.education,
                emergencyContactName: technician.emergencyContactName,
                emergencyContactPhone: technician.emergencyContactPhone,
                emergencyContactRelationship: technician.emergencyContactRelationship,
                hireDate: technician.hireDate.split('T')[0],
                nss: technician.nss || '',
                pantsSize: technician.pantsSize,
                rfc: technician.rfc || '',
                shirtSize: technician.shirtSize,
                shoeSize: technician.shoeSize,
                transportRoute: technician.transportRoute,
                vacationPeriod: technician.vacationPeriod,
                isBoss,
            });
        } else {
            reset({
                firstName: '', lastName: '', employeeNumber: '', departmentId: '', email: '', phone: '', password: '',
                positionId: '', address: '', allergies: '', birthDate: '', bloodType: '', childrenCount: 0,
                education: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
                hireDate: '', nss: '', pantsSize: '', rfc: '', shirtSize: '', shoeSize: '', transportRoute: '',
                isBoss: false,
            });
        }
    }, [open, technician, reset]);

    useEffect(() => {
        if (!open) setShowPassword(false);
    }, [open]);

    const onSubmit = async (values: FormValues) => {
        if (!techRoleId) {
            toast.error('No se encontró el rol TECHNICIAN en la base de datos.');
            return;
        }
        setIsSaving(true);

        try {
            const userPayload: UpdateUserInput = {
                firstName: values.firstName,
                lastName: values.lastName,
                employeeNumber: values.employeeNumber,
                departmentId: values.departmentId,
                email: values.email || undefined,
                phone: values.phone || undefined,
            };

            const techPayload = {
                positionId: values.positionId,
                address: values.address,
                allergies: values.allergies,
                birthDate: new Date(values.birthDate).toISOString(),
                bloodType: values.bloodType,
                childrenCount: Number(values.childrenCount),
                education: values.education,
                emergencyContactName: values.emergencyContactName,
                emergencyContactPhone: values.emergencyContactPhone,
                emergencyContactRelationship: values.emergencyContactRelationship,
                hireDate: new Date(values.hireDate).toISOString(),
                nss: values.nss || undefined,
                pantsSize: values.pantsSize,
                rfc: values.rfc || undefined,
                shirtSize: values.shirtSize,
                shoeSize: values.shoeSize,
                transportRoute: values.transportRoute,
                ...(isEditing && values.vacationPeriod !== undefined
                    ? { vacationPeriod: Number(values.vacationPeriod) }
                    : {}),
                isBoss: values.isBoss ?? false,
            };

            if (technician) {
                if (values.password) userPayload.password = values.password;
                await updateUser({ variables: { id: technician.user.id, input: userPayload } });
                await updateTechnician({ variables: { id: technician.id, input: { ...techPayload, id: technician.id } } });
                toast.success('Técnico actualizado correctamente.');
            } else {
                if (!values.password) throw new Error('La contraseña es requerida para nuevos técnicos.');
                const createPayload: CreateUserInput = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    employeeNumber: values.employeeNumber,
                    departmentId: values.departmentId ?? '',
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                    password: values.password,
                    roleIds: [techRoleId],
                };

                const userRes = await createUser({ variables: { input: createPayload } });
                const newUserId = userRes.data?.createUser.id;
                if (!newUserId) throw new Error('Error al generar el usuario.');

                await createTechnician({ variables: { input: { ...techPayload, userId: newUserId } } });
                toast.success('Técnico registrado correctamente.');
            }

            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error al guardar el técnico.');
        } finally {
            setIsSaving(false);
        }
    };

    const FieldError = ({ name }: { name: keyof FormValues }) => {
        const err = errors[name];
        return err ? <p className="text-xs text-destructive">{err.message}</p> : null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Perfil del Técnico' : 'Registrar Nuevo Técnico'}</DialogTitle>
                    <DialogDescription>Complete la información personal y laboral del empleado.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
                    {/* ---- 1. Credenciales y Sistema ---- */}
                    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">1. Credenciales y Sistema</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre(s) *</Label>
                                <Input {...register('firstName')} />
                                <FieldError name="firstName" />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos *</Label>
                                <Input {...register('lastName')} />
                                <FieldError name="lastName" />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Nómina *</Label>
                                <Input {...register('employeeNumber')} />
                                <FieldError name="employeeNumber" />
                            </div>
                            <div className="space-y-2">
                                <Label>{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        placeholder={isEditing ? 'Dejar vacío para no cambiar' : '********'}
                                        className="pr-10"
                                        autoComplete="new-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword((v) => !v)}
                                        disabled={isSaving}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <FieldError name="password" />
                            </div>
                        </div>
                    </div>

                    {/* ---- 2. Perfil Laboral ---- */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">2. Perfil Laboral</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Departamento *</Label>
                                <Controller name="departmentId" control={control} render={({ field }) => (
                                    <Combobox
                                        options={departments.map(d => ({ value: d.id, label: d.name }))}
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
                                        options={positions.map(p => ({ value: p.id, label: p.name }))}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Seleccionar cargo..."
                                        searchPlaceholder="Buscar..."
                                    />
                                )} />
                                <FieldError name="positionId" />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Contratación *</Label>
                                <Input type="date" {...register('hireDate')} />
                                <FieldError name="hireDate" />
                            </div>
                            {isEditing && (
                                <div className="space-y-2">
                                    <Label>Periodo Vacacional *</Label>
                                    <Input type="number" min="0" {...register('vacationPeriod')} />
                                    <FieldError name="vacationPeriod" />
                                </div>
                            )}
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

                    {/* ---- 3. Información Personal ---- */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">3. Información Personal</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Teléfono *</Label>
                                <Input {...register('phone')} />
                                <FieldError name="phone" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" {...register('email')} />
                                <FieldError name="email" />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Nacimiento *</Label>
                                <Input type="date" {...register('birthDate')} />
                                <FieldError name="birthDate" />
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                                <Label>Dirección Completa *</Label>
                                <Input {...register('address')} />
                                <FieldError name="address" />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Sangre *</Label>
                                <Input {...register('bloodType')} placeholder="Ej: O+" />
                                <FieldError name="bloodType" />
                            </div>
                            <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                <Label>Alergias *</Label>
                                <Input {...register('allergies')} placeholder="Ej: Ninguna, Penicilina..." />
                                <FieldError name="allergies" />
                            </div>

                            <div className="space-y-2">
                                <Label>Hijos (Cantidad) *</Label>
                                <Input type="number" min="0" {...register('childrenCount')} />
                                <FieldError name="childrenCount" />
                            </div>
                            <div className="space-y-2">
                                <Label>Escolaridad *</Label>
                                <Input {...register('education')} />
                                <FieldError name="education" />
                            </div>
                            <div className="space-y-2">
                                <Label>Ruta de Transporte *</Label>
                                <Input {...register('transportRoute')} />
                                <FieldError name="transportRoute" />
                            </div>

                            <div className="space-y-2">
                                <Label>NSS</Label>
                                <Input {...register('nss')} />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC</Label>
                                <Input {...register('rfc')} />
                            </div>
                        </div>
                    </div>

                    {/* ---- 4. Side-by-side: Emergencia + Tallas ---- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Contacto de Emergencia</h4>
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input {...register('emergencyContactName')} />
                                <FieldError name="emergencyContactName" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Teléfono *</Label>
                                    <Input {...register('emergencyContactPhone')} />
                                    <FieldError name="emergencyContactPhone" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Parentesco *</Label>
                                    <Input {...register('emergencyContactRelationship')} />
                                    <FieldError name="emergencyContactRelationship" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg border border-border">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Tallas de Uniforme</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Camisa *</Label>
                                    <Input {...register('shirtSize')} />
                                    <FieldError name="shirtSize" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pantalón *</Label>
                                    <Input {...register('pantsSize')} />
                                    <FieldError name="pantsSize" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Calzado *</Label>
                                    <Input {...register('shoeSize')} />
                                    <FieldError name="shoeSize" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border sticky bottom-0 bg-background">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Guardar Técnico
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
