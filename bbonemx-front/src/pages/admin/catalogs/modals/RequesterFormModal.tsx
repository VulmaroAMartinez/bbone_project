import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import {
    CreateUserDocument,
    UpdateUserDocument,
} from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface RequesterFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requester: any | null;
    requesterRoleId: string | undefined;
    departments: Array<{ id: string; name: string }>;
    onSuccess: () => void;
}

const createSchema = (isEditing: boolean) =>
    yup.object({
        firstName: yup.string().trim().required('El nombre es obligatorio'),
        lastName: yup.string().trim().required('Los apellidos son obligatorios'),
        employeeNumber: yup.string().trim().required('El n\u00famero de empleado es obligatorio'),
        departmentId: yup.string().required('Debe seleccionar un departamento'),
        email: yup.string().trim().email('Email no v\u00e1lido').default(''),
        phone: yup.string().trim().default(''),
        password: isEditing
            ? yup.string().default('')
            : yup
                  .string()
                  .required('La contrase\u00f1a inicial es obligatoria')
                  .min(8, 'M\u00ednimo 8 caracteres'),
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

    const {
        register,
        handleSubmit,
        reset,
        control,
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
            password: '',
        },
    });

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
                    password: '',
                });
            } else {
                reset({
                    employeeNumber: '',
                    firstName: '',
                    lastName: '',
                    departmentId: '',
                    email: '',
                    phone: '',
                    password: '',
                });
            }
        }
    }, [open, requester, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!requesterRoleId) {
            toast.error('Error de configuraci\u00f3n: No se encontr\u00f3 el rol "REQUESTER" en el sistema.');
            return;
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

            if (requester) {
                if (values.password?.trim()) input.password = values.password;
                await updateUser({ variables: { id: requester.id, input } });
                toast.success('Solicitante actualizado correctamente');
            } else {
                input.password = values.password;
                input.roleIds = [requesterRoleId];
                await createUser({ variables: { input } });
                toast.success('Solicitante creado correctamente');
            }

            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Ocurri\u00f3 un error al guardar');
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
                                <Input {...register('lastName')} placeholder="Ej: P\u00e9rez" />
                                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Identificaci\u00f3n */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Identificaci\u00f3n</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>N\u00famero de Empleado *</Label>
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
                                <Label>Tel\u00e9fono (Opcional)</Label>
                                <Input type="tel" {...register('phone')} placeholder="10 d\u00edgitos" />
                            </div>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="space-y-4 p-4 rounded-lg border border-border border-t-2">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Seguridad</h4>
                        <div className="space-y-2">
                            <Label>{isEditing ? 'Nueva Contrase\u00f1a (Opcional)' : 'Contrase\u00f1a Inicial *'}</Label>
                            <Input
                                type="password"
                                {...register('password')}
                                placeholder={isEditing ? 'Dejar en blanco para no cambiar' : '********'}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            {isEditing && <p className="text-xs text-muted-foreground">Si no desea cambiar la contrase\u00f1a del usuario, deje este campo vac\u00edo.</p>}
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
