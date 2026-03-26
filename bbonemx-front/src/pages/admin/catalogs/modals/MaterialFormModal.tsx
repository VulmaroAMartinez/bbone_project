import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    CreateMaterialDocument,
    UpdateMaterialDocument,
} from '@/lib/graphql/generated/graphql';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const schema = yup.object({
    description: yup.string().trim().required('La descripcion es obligatoria'),
    brand: yup.string().trim().default(''),
    manufacturer: yup.string().trim().default(''),
    model: yup.string().trim().default(''),
    partNumber: yup.string().trim().default(''),
    sku: yup.string().trim().default(''),
    unitOfMeasure: yup.string().trim().default(''),
});

type FormValues = yup.InferType<typeof schema>;

interface MaterialFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    material: {
        id?: string;
        description?: string | null;
        brand?: string | null;
        manufacturer?: string | null;
        model?: string | null;
        partNumber?: string | null;
        sku?: string | null;
        unitOfMeasure?: string | null;
    } | null;
    onSuccess: () => void;
}

export default function MaterialFormModal({ open, onOpenChange, material, onSuccess }: MaterialFormModalProps) {
    const [createMaterial, { loading: creating }] = useMutation(CreateMaterialDocument);
    const [updateMaterial, { loading: updating }] = useMutation(UpdateMaterialDocument);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { description: '', brand: '', manufacturer: '', model: '', partNumber: '', sku: '', unitOfMeasure: '' },
    });

    useEffect(() => {
        if (open) {
            if (material) {
                reset({
                    description: material.description || '',
                    brand: material.brand || '',
                    manufacturer: material.manufacturer || '',
                    model: material.model || '',
                    partNumber: material.partNumber || '',
                    sku: material.sku || '',
                    unitOfMeasure: material.unitOfMeasure || '',
                });
            } else {
                reset({ description: '', brand: '', manufacturer: '', model: '', partNumber: '', sku: '', unitOfMeasure: '' });
            }
        }
    }, [open, material, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (material?.id) {
                await updateMaterial({ variables: { id: material.id, input: { ...values } } });
            } else {
                await createMaterial({ variables: { input: { ...values } } });
            }
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error('Error al guardar el material');
        }
    };

    const isSaving = creating || updating;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{material ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                    {/* Identificacion */}
                    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Identificacion
                        </h4>
                        <div className="space-y-2">
                            <Label>Descripcion *</Label>
                            <Input {...register('description')} placeholder="Ej: Aceite lubricante multiusos..." />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>
                    </div>

                    {/* Catalogo */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Catalogo
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input {...register('sku')} />
                            </div>
                            <div className="space-y-2">
                                <Label>No. de Parte</Label>
                                <Input {...register('partNumber')} />
                            </div>
                        </div>
                    </div>

                    {/* Proveedor / Fabricante */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Proveedor / Fabricante
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input {...register('brand')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input {...register('model')} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Fabricante</Label>
                                <Input {...register('manufacturer')} />
                            </div>
                        </div>
                    </div>

                    {/* Unidad */}
                    <div className="space-y-4 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Unidad
                        </h4>
                        <div className="space-y-2">
                            <Label>U. de Medida</Label>
                            <Input {...register('unitOfMeasure')} placeholder="Ej: Lts, Pza, Cajas..." />
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
