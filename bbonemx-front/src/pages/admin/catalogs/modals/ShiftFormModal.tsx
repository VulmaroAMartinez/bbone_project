import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreateShiftDocument, UpdateShiftDocument } from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const schema = yup.object({
    name: yup.string().trim().required('El nombre es obligatorio'),
    startTime: yup.string().required('La hora de inicio es obligatoria'),
    endTime: yup.string().required('La hora de fin es obligatoria'),
});

type FormValues = yup.InferType<typeof schema>;

interface ShiftFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shift: { id: string; name: string; startTime: string; endTime: string } | null;
    onSuccess: () => void;
}

export default function ShiftFormModal({ open, onOpenChange, shift, onSuccess }: ShiftFormModalProps) {
    const [createShift, { loading: creating }] = useMutation(CreateShiftDocument);
    const [updateShift, { loading: updating }] = useMutation(UpdateShiftDocument);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', startTime: '07:00', endTime: '15:00' },
    });

    useEffect(() => {
        if (shift) {
            reset({
                name: shift.name,
                startTime: shift.startTime.slice(0, 5),
                endTime: shift.endTime.slice(0, 5),
            });
        } else {
            reset({ name: '', startTime: '07:00', endTime: '15:00' });
        }
    }, [shift, reset]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            name: values.name,
            startTime: values.startTime.length === 5 ? `${values.startTime}:00` : values.startTime,
            endTime: values.endTime.length === 5 ? `${values.endTime}:00` : values.endTime,
        };

        try {
            if (shift) {
                await updateShift({ variables: { id: shift.id, input: payload } });
                toast.success('Turno actualizado correctamente');
            } else {
                await createShift({ variables: { input: payload } });
                toast.success('Turno creado correctamente');
            }
            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error al guardar el turno');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{shift ? 'Editar Turno' : 'Nuevo Turno'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-muted-foreground">Nombre</h4>
                        <div className="space-y-2">
                            <Label>Nombre del Turno *</Label>
                            <Input {...register('name')} placeholder="Ej: Matutino, Vespertino..." />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-muted-foreground">Horario</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hora Inicio *</Label>
                                <Input type="time" {...register('startTime')} />
                                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Hora Fin *</Label>
                                <Input type="time" {...register('endTime')} />
                                {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
                            </div>
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
