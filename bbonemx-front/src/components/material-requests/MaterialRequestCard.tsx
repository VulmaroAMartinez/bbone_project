import { Eye, User, Cog, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CATEGORY_LABELS,
  IMPORTANCE_COLORS,
  IMPORTANCE_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  formatDate,
} from './material-request.constants';

interface MaterialRequestItem {
  id: string;
  customName?: string | null;
  description?: string | null;
  requestedQuantity?: number | null;
  unitOfMeasure?: string | null;
  isGenericAllowed?: boolean | null;
  brand?: string | null;
  partNumber?: string | null;
}

export interface MaterialRequestCardData {
  id: string;
  folio: string;
  priority: string;
  importance: string;
  category: string;
  description?: string | null;
  createdAt: string;
  isActive?: boolean | null;
  requester?: { fullName: string } | null;
  machines?: Array<{
    machine: {
      name: string;
      area?: { name: string } | null;
      subArea?: { area?: { name: string } | null } | null;
    };
  }> | null;
  items?: MaterialRequestItem[] | null;
}

interface MaterialRequestCardProps extends MaterialRequestCardData {
  onClick: () => void;
  onViewItems?: () => void;
}

export function MaterialRequestCard({
  folio,
  priority,
  importance,
  category,
  description,
  createdAt,
  isActive,
  requester,
  machines,
  items,
  onClick,
  onViewItems,
}: MaterialRequestCardProps) {
  const machineEntities = (machines ?? []).map((mrm) => mrm.machine);
  const areaNames = new Set(
    machineEntities.map((m) => m.area?.name ?? m.subArea?.area?.name).filter(Boolean)
  );
  const areaName =
    areaNames.size === 1 ? [...areaNames][0] : areaNames.size > 1 ? 'Diversas áreas' : undefined;
  const firstMachine = machineEntities[0];
  const extraCount = machineEntities.length - 1;

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] ${!isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-semibold text-sm text-primary tracking-wide">
                {folio}
              </span>
              <span
                className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[priority] ?? ''}`}
              >
                {PRIORITY_LABELS[priority] ?? priority}
              </span>
              <span
                className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${IMPORTANCE_COLORS[importance] ?? ''}`}
              >
                {IMPORTANCE_LABELS[importance] ?? importance}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                {CATEGORY_LABELS[category] ?? category}
              </Badge>
            </div>

            {category === 'SERVICE' || category === 'SERVICE_WITH_MATERIAL' ? (
              <p className="mt-2 text-base text-foreground line-clamp-2">
                {description?.trim() || '—'}
              </p>
            ) : items && items.length > 0 ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-base text-foreground">
                  {items.length} artículo{items.length !== 1 ? 's' : ''} solicitado
                  {items.length !== 1 ? 's' : ''}
                </p>
                {onViewItems && (
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Ver detalles"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewItems();
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2 text-muted-foreground pt-1.5 border-t border-border/40">
              {requester && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 shrink-0" />
                  {requester.fullName}
                </span>
              )}
              {firstMachine && (
                <span className="flex items-center gap-1">
                  <Cog className="h-3 w-3 shrink-0" />
                  {firstMachine.name}
                  {extraCount > 0 && (
                    <span className="text-xs text-muted-foreground/70">(+{extraCount})</span>
                  )}
                </span>
              )}
              {areaName && <span className="text-muted-foreground/80">{areaName as string}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDate(createdAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
