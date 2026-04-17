import { useEffect } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import {
    CreateUserDocument,
    UpdateUserDocument,
    GetAreasDocument,
    GetSubAreasByAreaDocument,
    type CreateUserInput,
    type UpdateUserInput,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { AreaBasicFragmentDoc, SubAreaBasicFragmentDoc } from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, MapPin } from 'lucide-react';

interface RequesterFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requester: {
        id: string;
        employeeNumber: string;
        firstName: string;
        lastName: string;
        department?: { id: string } | null;
        email?: string | null;
        phone?: string | null;
        areaId?: string | null;
        subAreaId?: string | null;
    } | null;
    requesterRoleId: string | undefined;
    departments: Array<{ id: string; name: string }>;
    onSuccess: () => void;
}

const createSchema = (isEditing: boolean) =>
    yup.object({
        firstName: yup.string().trim().required('El nombre es obligatorio'),
        lastName: yup.string().trim().required('Los apellidos son obligatorios'),
        employeeNumber: yup.string().trim().required('El número de empleado es obligatorio'),
        departmentId: yup.string().required('Debe seleccionar un departamento'),
        email: yup.string().trim().email('Email no válido').default(''),
        phone: yup.string().trim().default(''),
        areaId: yup.string().default(''),
        subAreaId: yup.string().default(''),
        password: isEditing
            ? yup.string().default('')
            : yup
                .string()
                .required('La contraseña inicial es obligatoria')
                .min(8, 'Mínimo 8 caracteres'),
    });

type FormValues = yup.InferType<ReturnType<typeof createSchema>>;

export default function RequesterFormModal({
    open,
    onOpenChange,
    requester,
    requesterRoleId,
    departments,
    onSuccess,
}: RequesterFormModalProps) {
    const isEditing = !!requester;

    const [createUser, { loading: creating }] = useMutation(CreateUserDocument);
    const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument);

    const { data: areasData } = useQuery(GetAreasDocument);
    const [getSubAreas, { data: subAreasData }] = useLazyQuery(GetSubAreasByAreaDocument, {
        fetchPolicy: 'network-only',
    });

    const areas = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
    const subAreas = subAreasData?.subAreasByArea
        ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
        : [];

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(createSchema(isEditing)),
        defaultValues: {
            employeeNumber: '',
            firstName: '',
            lastName: '',
            departmentId: '',
            email: '',
            phone: '',
            areaId: '',
            subAreaId: '',
            password: '',
        },
    });

    const selectedAreaId = watch('areaId');

    const handleAreaChange = (value: string) => {
        setValue('areaId', value);
        setValue('subAreaId', '');
        if (value) {
            getSubAreas({ variables: { areaId: value } });
        }
    };

    useEffect(() => {
        if (open) {
            if (requester) {
                reset({
                    employeeNumber: requester.employeeNumber,
                    firstName: requester.firstName,
                    lastName: requester.lastName,
                    departmentId: requester.department?.id || '',
                    email: requester.email || '',
                    phone: requester.phone || '',
                    areaId: requester.areaId || '',
                    subAreaId: requester.subAreaId || '',
                    password: '',
                });
                if (requester.areaId) {
                    getSubAreas({ variables: { areaId: requester.areaId } });
                }
            } else {
                reset({
                    employeeNumber: '',
                    firstName: '',
                    lastName: '',
                    departmentId: '',
                    email: '',
                    phone: '',
                    areaId: '',
                    subAreaId: '',
                    password: '',
                });
            }
        }
    }, [open, requester, reset, getSubAreas]);

    const onSubmit = async (values: FormValues) => {
        if (!requesterRoleId) {
            toast.error('Error de configuraci\u00f3n: No se encontr\u00f3 el rol "REQUESTER" en el sistema.');
            return;
        }

        try {
            const input = {
                firstName: values.firstName,
                lastName: values.lastName,
                employeeNumber: values.employeeNumber,
                departmentId: values.departmentId,
                email: values.email || undefined,
                phone: values.phone || undefined,
                areaId: values.areaId || undefined,
                subAreaId: values.subAreaId || undefined,
            } as UpdateUserInput & { areaId?: string; subAreaId?: string };

            if (requester) {
                if (values.password?.trim()) input.password = values.password;
                await updateUser({ variables: { id: requester.id, input } });
                toast.success('Solicitante actualizado correctamente');
            } else {
                const createPayload: CreateUserInput = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    employeeNumber: values.employeeNumber,
                    departmentId: values.departmentId ?? '',
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                    password: values.password,
                    roleIds: [requesterRoleId],
                };
                await createUser({ variables: { input: createPayload } });
                toast.success('Solicitante creado correctamente');
            }

            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Ocurrió un error al guardar');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Solicitante' : 'Nuevo Solicitante'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* Datos Personales */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Datos Personales</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre(s) *</Label>
                                <Input {...register('firstName')} placeholder="Ej: Juan" />
                                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos *</Label>
                                <Input {...register('lastName')} placeholder="Ej: P9rez" />
                                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Identificación */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Identificación</h4>
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
                                        <Combobox
                                            options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Seleccionar departamento..."
                                            searchPlaceholder="Buscar..."
                                        />
                                    )}
                                />
                                {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Contacto</h4>
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
                    </div>

                    {/* Alcance de Solicitudes */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Alcance de Solicitudes
                        </h4>
                        <p className="text-xs text-muted-foreground -mt-2">
                            Opcional. Si se asigna, el solicitante solo podrá crear órdenes para esta área/sub-área.
                        </p>
                        <div className="space-y-2">
                            <Label>Área</Label>
                            <Controller
                                name="areaId"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={[
                                            { value: '', label: 'Sin restricción' },
                                            ...areas.map(a => ({ value: a.id, label: a.name })),
                                        ]}
                                        value={field.value}
                                        onValueChange={handleAreaChange}
                                        placeholder="Sin restricción"
                                        searchPlaceholder="Buscar área..."
                                    />
                                )}
                            />
                        </div>
                        {selectedAreaId && (subAreas.length > 0 || !!watch('subAreaId')) && (
                            <div className="space-y-2">
                                <Label>Sub-área</Label>
                                <Controller
                                    name="subAreaId"
                                    control={control}
                                    render={({ field }) => (
                                        <Combobox
                                            options={[
                                                { value: '', label: 'Cualquier sub-área del área' },
                                                ...subAreas.map(sa => ({ value: sa.id, label: sa.name })),
                                            ]}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Cualquier sub-área"
                                            searchPlaceholder="Buscar sub-área..."
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Seguridad */}
                    <div className="space-y-4 p-4 rounded-lg border border-border border-t-2">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Seguridad</h4>
                        <div className="space-y-2">
                            <Label>{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial *'}</Label>
                            <Input
                                type="password"
                                {...register('password')}
                                placeholder={isEditing ? 'Dejar en blanco para no cambiar' : '********'}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            {isEditing && <p className="text-xs text-muted-foreground">Si no desea cambiar la contrase\u00f1a del usuario, deje este campo vacío.</p>}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={creating || updating}>
                            {(creating || updating) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Guardar Solicitante
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
