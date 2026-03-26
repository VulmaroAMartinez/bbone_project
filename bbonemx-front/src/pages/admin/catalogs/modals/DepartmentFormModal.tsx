import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreateDepartmentDocument, UpdateDepartmentDocument } from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const schema = yup.object({
    name: yup.string().trim().required('El nombre es obligatorio'),
    description: yup.string().trim().default(''),
});

type FormValues = yup.InferType<typeof schema>;

interface DepartmentFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department: { id: string; name: string; description?: string | null } | null;
    onSuccess: () => void;
}

export default function DepartmentFormModal({ open, onOpenChange, department, onSuccess }: DepartmentFormModalProps) {
    const [createDepartment, { loading: creating }] = useMutation(CreateDepartmentDocument);
    const [updateDepartment, { loading: updating }] = useMutation(UpdateDepartmentDocument);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        if (department) {
            reset({ name: department.name, description: department.description || '' });
        } else {
            reset({ name: '', description: '' });
        }
    }, [department, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (department) {
                await updateDepartment({ variables: { id: department.id, input: { ...values } } });
                toast.success('Departamento actualizado correctamente');
            } else {
                await createDepartment({ variables: { input: { ...values } } });
                toast.success('Departamento creado correctamente');
            }
            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error al guardar el departamento');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{department ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input {...register('name')} placeholder="Ej: Mantenimiento, Produccion..." />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Descripcion</Label>
                            <Input {...register('description')} placeholder="Opcional..." />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={creating || updating}>Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
