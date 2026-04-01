import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
      <div className="rounded-full bg-muted p-6">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Sin conexión a internet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conéctate para iniciar sesión o continuar.
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Reintentar
      </Button>
    </div>
  );
}
