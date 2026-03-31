import { useRegisterSW } from 'virtual:pwa-register/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="pt-4 pb-2">
          <p className="text-sm font-medium">Nueva versión disponible</p>
          <p className="text-xs text-muted-foreground mt-1">
            Hay una actualización lista. Recarga para aplicarla.
          </p>
        </CardContent>
        <CardFooter className="gap-2 pb-4">
          <Button
            size="sm"
            onClick={() => updateServiceWorker(true)}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar ahora
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setNeedRefresh(false)}
          >
            Después
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
