import { useQuery } from '@apollo/client/react';
import {
  GetSubAreasByAreaDocument,
  type AreaType,
  type AreaDetailFragment,
  SubAreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

const AREA_TYPE_LABELS: Record<AreaType, string> = {
  OPERATIONAL: 'Operativa',
  SERVICE: 'Servicio',
  PRODUCTION: 'Producción',
};

const AREA_TYPE_COLORS: Record<AreaType, string> = {
  OPERATIONAL: 'bg-blue-100 text-blue-700',
  SERVICE: 'bg-purple-100 text-purple-700',
  PRODUCTION: 'bg-orange-100 text-orange-700',
};

interface AreaInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDetailFragment | null;
}

export function AreaInfoModal({ open, onOpenChange, area }: AreaInfoModalProps) {
  const { data: subAreasData, loading: subAreasLoading } = useQuery(GetSubAreasByAreaDocument, {
    variables: { areaId: area?.id ?? '' },
    skip: !area?.id || !open,
    fetchPolicy: 'cache-and-network',
  });

  const subAreas = subAreasData?.subAreasByArea
    ? unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {area?.name}
          </DialogTitle>
        </DialogHeader>

        {area && (
          <div className="space-y-4 pt-1">
            {/* Tipo y Estado */}
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/10">
              <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                Información General
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tipo</p>
                  <span
                    className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${AREA_TYPE_COLORS[area.type as AreaType]}`}
                  >
                    {AREA_TYPE_LABELS[area.type as AreaType]}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Estado</p>
                  <Badge
                    variant={area.isActive ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {area.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>

              {area.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Descripción</p>
                  <p className="text-sm text-foreground">{area.description}</p>
                </div>
              )}
            </div>

            {/* Sub-áreas */}
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                Sub-áreas
              </h4>
              {subAreasLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ) : subAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Sin sub-áreas registradas
                </p>
              ) : (
                <div className="space-y-1.5">
                  {subAreas.map((sa) => (
                    <div
                      key={sa.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 text-sm"
                    >
                      <span className="font-medium">{sa.name}</span>
                      {!sa.isActive && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Inactiva
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              Creada el{' '}
              {new Date(area.createdAt).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
