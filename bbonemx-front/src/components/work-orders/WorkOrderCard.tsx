import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, MaintenanceTypeBadge } from '@/components/ui/status-badge';
import type { WorkOrderStatus, WorkOrderPriority, MaintenanceType } from '@/lib/graphql/generated/graphql';
import { MapPin, Calendar, UserPlus, User, Wrench, ChevronRight, Pen } from 'lucide-react';

export interface WorkOrderCardData {
  id: string;
  folio?: string | null;
  status: WorkOrderStatus;
  priority?: WorkOrderPriority | null;
  maintenanceType?: MaintenanceType | null;
  description?: string | null;
  createdAt: string;
  area?: { name?: string | null } | null;
  subArea?: { name?: string | null } | null;
  machine?: { name?: string | null; code?: string | null } | null;
  leadTechnician?: { firstName?: string | null; lastName?: string | null } | null;
  requester?: { fullName?: string | null } | null;
}

interface WorkOrderCardProps extends WorkOrderCardData {
  onClick: () => void;
  showPendingSignature?: boolean;
  action?: ReactNode;
}

export function WorkOrderCard({
  folio,
  status,
  priority,
  maintenanceType,
  description,
  createdAt,
  area,
  subArea,
  machine,
  leadTechnician,
  requester,
  onClick,
  showPendingSignature,
  action,
}: WorkOrderCardProps) {
  return (
    <Card
      className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all shadow-sm cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                {folio}
              </span>
              <StatusBadge status={status} />
              {priority && <PriorityBadge priority={priority} size="sm" />}
              {maintenanceType && <MaintenanceTypeBadge type={maintenanceType} size="sm" />}
              {showPendingSignature && (status === 'FINISHED' || status === 'TEMPORARY_REPAIR') && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Pen className="h-3 w-3" /> Firma pendiente
                </span>
              )}
            </div>
            <p className="text-sm text-foreground line-clamp-2">{description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
              {area?.name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {area.name}{subArea?.name ? ` - ${subArea.name}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(createdAt).toLocaleDateString('es-MX')}
              </span>
              {leadTechnician?.firstName && leadTechnician?.lastName && (
                <span className="flex items-center gap-1 font-medium text-primary/80">
                  <UserPlus className="h-3 w-3" />
                  Líder: {leadTechnician.firstName} {leadTechnician.lastName}
                </span>
              )}
              {requester?.fullName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {requester.fullName}
                </span>
              )}
              {machine?.name && (
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  {machine.name}{machine.code ? ` [${machine.code}]` : ''}
                </span>
              )}
            </div>
            {action && <div className="mt-4 flex justify-end">{action}</div>}
          </div>
          {!action && (
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 hidden md:block" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
