import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PauseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  isPausing: boolean;
}

export function PauseModal({ open, onOpenChange, onConfirm, isPausing }: PauseModalProps) {
  const [pauseReason, setPauseReason] = useState('');

  const handleConfirm = async () => {
    if (!pauseReason.trim()) return;
    await onConfirm(pauseReason.trim());
    setPauseReason('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) setPauseReason('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pausar Orden de Trabajo</DialogTitle>
          <DialogDescription>
            Indica el motivo. Solo el Administrador podrá reanudarla.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Motivo de la Pausa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Ej: Falta de refacción, espera de proveedor..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!pauseReason.trim() || isPausing}
          >
            {isPausing ? 'Pausando...' : 'Confirmar Pausa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
