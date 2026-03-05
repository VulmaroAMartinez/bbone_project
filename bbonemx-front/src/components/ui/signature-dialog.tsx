import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'
import { Button } from './button';
import { Loader2, Eraser, Check } from 'lucide-react';

interface SignatureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureDataURL: string) => Promise<void>;
    title?: string;
}

export function SignatureDialog({ isOpen, onClose, onSave, title = 'Firmar Orden' }: SignatureDialogProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleClear = () => {
        sigCanvas.current?.clear();
    }

    const handleSave = async () => {
        if (sigCanvas.current?.isEmpty()) {
            alert('Por favor, firme en el área de la pantalla.');
            return;
        }

        setIsSaving(true);
        try {
            const dataURL = await sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

            if (dataURL) {
                await onSave(dataURL);
                onClose();
                handleClear();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isSaving) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        Dibuje su firma en el recuadro inferior de manera clara.
                    </DialogDescription>
                </DialogHeader>

                <div className='border-2 border-dashed border-border rounded-lg bg-white overflow-hidden my-4 relative shadow-inner'>
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor='blue'
                        canvasProps={{
                            className: 'w-full h-48 cursor-crosshair touch-none'
                        }}
                    />
                </div>

                <div className='flex justify-between gap-3 mt-2'>
                    <Button variant="outline" onClick={handleClear} disabled={isSaving} className="gap-2">
                        <Eraser className='w-4 h-4' /> Limpiar
                    </Button>

                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Guardar Firma
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
