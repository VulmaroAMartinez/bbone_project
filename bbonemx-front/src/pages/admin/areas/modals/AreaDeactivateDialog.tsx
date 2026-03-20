import type { AreaDetailFragment } from '@/lib/graphql/generated/graphql';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AreaDeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDetailFragment | null;
  onConfirm: () => Promise<void>;
}

export function AreaDeactivateDialog({
  open,
  onOpenChange,
  area,
  onConfirm,
}: AreaDeactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar área?</AlertDialogTitle>
          <AlertDialogDescription>
            El área <strong>{area?.name}</strong> quedará inactiva.
            Podrás reactivarla en cualquier momento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
