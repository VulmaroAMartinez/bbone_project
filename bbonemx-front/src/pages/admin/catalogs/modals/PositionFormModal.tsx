import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreatePositionDocument, UpdatePositionDocument } from '@/lib/graphql/generated/graphql';

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

interface PositionFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: { id: string; name: string; description?: string | null } | null;
    onSuccess: () => void;
}

export default function PositionFormModal({ open, onOpenChange, position, onSuccess }: PositionFormModalProps) {
    const [createPosition, { loading: creating }] = useMutation(CreatePositionDocument);
    const [updatePosition, { loading: updating }] = useMutation(UpdatePositionDocument);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        if (position) {
            reset({ name: position.name, description: position.description || '' });
        } else {
            reset({ name: '', description: '' });
        }
    }, [position, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (position) {
                await updatePosition({ variables: { id: position.id, input: { ...values } } });
                toast.success('Cargo actualizado correctamente');
            } else {
                await createPosition({ variables: { input: { ...values } } });
                toast.success('Cargo creado correctamente');
            }
            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error al guardar el cargo');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{position ? 'Editar Cargo' : 'Nuevo Cargo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input {...register('name')} placeholder="Ej: Tecnico Mecanico Nivel 2" />
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
