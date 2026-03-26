import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    GetMachinesPageDataDocument,
    CreateSparePartDocument,
    UpdateSparePartDocument,
    MachineBasicFragmentDoc,
    type MachineBasicFragment,
    type GetMachinesPageDataQuery,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const schema = yup.object({
    partNumber: yup.string().trim().required('El número de parte es obligatorio'),
    machineId: yup.string().required('Debe seleccionar una máquina'),
    brand: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    supplier: yup.string().trim().default(''),
    unitOfMeasure: yup.string().trim().default(''),
});

type FormValues = yup.InferType<typeof schema>;

interface SparePartFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sparePart: {
        id?: string;
        partNumber?: string | null;
        machine?: { id?: string | null } | null;
        brand?: string | null;
        model?: string | null;
        supplier?: string | null;
        unitOfMeasure?: string | null;
    } | null;
    onSuccess: () => void;
}

export default function SparePartFormModal({ open, onOpenChange, sparePart, onSuccess }: SparePartFormModalProps) {
    const { data: machinesData, loading: loadingMachines } = useQuery<GetMachinesPageDataQuery>(GetMachinesPageDataDocument);

    const [createSparePart, { loading: creating }] = useMutation(CreateSparePartDocument);
    const [updateSparePart, { loading: updating }] = useMutation(UpdateSparePartDocument);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { partNumber: '', machineId: '', brand: '', model: '', supplier: '', unitOfMeasure: '' },
    });

    const machineRefs = machinesData?.machinesWithDeleted ?? [];
    const machines = useFragment(MachineBasicFragmentDoc, machineRefs) as MachineBasicFragment[];

    useEffect(() => {
        if (open) {
            if (sparePart) {
                reset({
                    partNumber: sparePart.partNumber || '',
                    machineId: sparePart.machine?.id || '',
                    brand: sparePart.brand || '',
                    model: sparePart.model || '',
                    supplier: sparePart.supplier || '',
                    unitOfMeasure: sparePart.unitOfMeasure || '',
                });
            } else {
                reset({ partNumber: '', machineId: '', brand: '', model: '', supplier: '', unitOfMeasure: '' });
            }
        }
    }, [open, sparePart, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (sparePart?.id) {
                await updateSparePart({ variables: { id: sparePart.id, input: { ...values } } });
            } else {
                await createSparePart({ variables: { input: { ...values } } });
            }
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error('Error al guardar la refacción');
        }
    };

    const isSaving = creating || updating;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{sparePart ? 'Editar Refacción' : 'Nueva Refacción'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                    {/* Máquina */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Máquina</h4>
                        <div className="space-y-2">
                            <Label className="text-primary font-semibold">Máquina a la que pertenece *</Label>
                            <Controller
                                name="machineId"
                                control={control}
                                render={({ field }) => (
                                    <Combobox
                                        options={machines.map((m) => ({ value: m.id, label: `${m.name} [${m.code}]` }))}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={loadingMachines ? 'Cargando...' : 'Seleccionar máquina...'}
                                        searchPlaceholder="Buscar máquina..."
                                        disabled={loadingMachines}
                                    />
                                )}
                            />
                            {errors.machineId && <p className="text-xs text-destructive">{errors.machineId.message}</p>}
                        </div>
                    </div>

                    {/* Identificación */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Identificación</h4>
                        <div className="space-y-2">
                            <Label>Número de Parte *</Label>
                            <Input {...register('partNumber')} placeholder="Ej: BAL-608-ZZ" />
                            {errors.partNumber && <p className="text-xs text-destructive">{errors.partNumber.message}</p>}
                        </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Detalles</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input {...register('brand')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input {...register('model')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Proveedor</Label>
                                <Input {...register('supplier')} />
                            </div>
                            <div className="space-y-2">
                                <Label>U. de Medida</Label>
                                <Input {...register('unitOfMeasure')} placeholder="Ej: Pza, Juego..." />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
