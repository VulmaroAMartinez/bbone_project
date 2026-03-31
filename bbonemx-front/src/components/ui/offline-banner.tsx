import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Sin conexión. Mostrando datos almacenados en caché.</span>
    </div>
  );
}
