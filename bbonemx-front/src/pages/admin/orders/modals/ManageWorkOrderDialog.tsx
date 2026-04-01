import type React from 'react';

import type { MaintenanceType, WorkOrderPriority, StopType } from '@/lib/graphql/generated/graphql';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Trash2, UserPlus } from 'lucide-react';

export type WorkTypeValue =
  | 'PAINTING'
  | 'PNEUMATIC'
  | 'ELECTRONIC'
  | 'ELECTRICAL'
  | 'BUILDING'
  | 'METROLOGY'
  | 'AUTOMATION'
  | 'MECHANICAL'
  | 'HYDRAULIC'
  | 'ELECTRICAL_CONTROL'
  | 'OTHER';

export type MgmtState = {
  priority: WorkOrderPriority | undefined;
  stoppageType: StopType | undefined;
  shiftId: string;
  maintenanceType: MaintenanceType | undefined;
  scheduledDate: string;
  workType: WorkTypeValue | undefined;
  machineId: string;
  leadTechnicianId: string;
};

export function ManageWorkOrderDialog({
  open,
  onOpenChange,
  showMachineField,
  showScheduledDate,
  isPending,
  isProcessing,
  mgmt,
  setMgmt,
  auxiliaryTechnicians,
  setAuxiliaryTechnicians,
  machineOptions,
  techOptions,
  shifts,
  priorities,
  stoppageTypes,
  maintenanceTypes,
  workTypes,
  disableBreakdown,
  breakdownDisabledHint,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showMachineField: boolean;
  showScheduledDate: boolean;
  isPending: boolean;
  isProcessing: boolean;
  mgmt: MgmtState;
  setMgmt: React.Dispatch<React.SetStateAction<MgmtState>>;
  auxiliaryTechnicians: string[];
  setAuxiliaryTechnicians: React.Dispatch<React.SetStateAction<string[]>>;
  machineOptions: Array<{ value: string; label: string }>;
  techOptions: Array<{ value: string; label: string }>;
  shifts: Array<{ id: string; name: string }>;
  priorities: Array<{ value: WorkOrderPriority; label: string }>;
  stoppageTypes: Array<{ value: StopType; label: string }>;
  maintenanceTypes: Array<{ value: MaintenanceType; label: string }>;
  workTypes: Array<{ value: WorkTypeValue; label: string }>;
  disableBreakdown: boolean;
  breakdownDisabledHint: string;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Gestionar Orden de Trabajo</DialogTitle>
          <DialogDescription>Define los parámetros técnicos y el equipo de trabajo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bloque 1: Parámetros (Siempre editable) */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">1. Parámetros Generales</h4>

            <div className="grid gap-4 md:grid-cols-2">
              {showMachineField && (
                <div className="space-y-2 pb-2 border-b border-border/50 md:col-span-2">
                  <Label htmlFor="mgmt-machine" className="text-destructive font-semibold">
                    Equipo/Estructura Afectado (Requerido)*
                  </Label>
                  <Combobox
                    options={machineOptions}
                    value={mgmt.machineId}
                    onValueChange={(v) => setMgmt((p) => ({ ...p, machineId: v }))}
                    placeholder="Seleccionar Equipo/Estructura"
                    searchPlaceholder="Buscar equipo/estructura..."
                    emptyText="No hay equipos disponibles"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="mgmt-priority">Prioridad</Label>
                <Select
                  value={mgmt.priority ?? ''}
                  onValueChange={(v) => setMgmt((p) => ({ ...p, priority: v as WorkOrderPriority }))}
                >
                  <SelectTrigger id="mgmt-priority" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mgmt-stoppage">Tipo de Parada</Label>
                <Select
                  value={mgmt.stoppageType ?? ''}
                  onValueChange={(v) => setMgmt((p) => ({ ...p, stoppageType: v as StopType }))}
                >
                  <SelectTrigger id="mgmt-stoppage" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {stoppageTypes.map((s) => (
                      <SelectItem key={s.value} value={s.value} disabled={s.value === 'BREAKDOWN' && disableBreakdown}>
                        {s.label}
                        {s.value === 'BREAKDOWN' && disableBreakdown ? ` (${breakdownDisabledHint})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mgmt-shift">Turno</Label>
                <Select value={mgmt.shiftId} onValueChange={(v) => setMgmt((p) => ({ ...p, shiftId: v }))}>
                  <SelectTrigger id="mgmt-shift" className="w-full">
                    <SelectValue placeholder="Seleccionar Turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mgmt-maintenance">Tipo de Mantenimiento</Label>
                <Select
                  value={mgmt.maintenanceType ?? ''}
                  onValueChange={(v) => setMgmt((p) => ({ ...p, maintenanceType: v as MaintenanceType }))}
                >
                  <SelectTrigger id="mgmt-maintenance" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mgmt-work-type">Tipo de trabajo *</Label>
                <Select value={mgmt.workType ?? ''} onValueChange={(v) => setMgmt((p) => ({ ...p, workType: v as WorkTypeValue }))}>
                  <SelectTrigger id="mgmt-work-type" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((wt) => (
                      <SelectItem key={wt.value} value={wt.value}>
                        {wt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showScheduledDate && (
              <div className="space-y-2">
                <Label htmlFor="mgmt-scheduled-date">Fecha programada *</Label>
                <Input
                  id="mgmt-scheduled-date"
                  type="date"
                  value={mgmt.scheduledDate}
                  onChange={(e) => setMgmt((p) => ({ ...p, scheduledDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Bloque 2: Equipo Técnico (Condicional) */}
          <div
            className={`space-y-4 p-4 rounded-lg border border-border ${!isPending ? 'opacity-50 pointer-events-none bg-muted' : 'bg-primary/5'}`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">2. Asignación de Personal</h4>
              {!isPending && <Badge variant="outline" className="text-xs">Bloqueado (Orden ya inició)</Badge>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mgmt-lead-tech">Técnico Líder *</Label>
              <Combobox
                options={techOptions}
                value={mgmt.leadTechnicianId}
                onValueChange={(v) => setMgmt((p) => ({ ...p, leadTechnicianId: v }))}
                placeholder="Seleccionar líder"
                searchPlaceholder="Buscar técnico..."
              />
            </div>

            <div className="space-y-3" role="group" aria-labelledby="mgmt-aux-tech-label">
              <Label id="mgmt-aux-tech-label" className="text-sm">Técnicos de Apoyo (Opcional)</Label>

              {auxiliaryTechnicians.map((auxTechId, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Combobox
                    options={techOptions.filter((o) => o.value !== mgmt.leadTechnicianId)}
                    value={auxTechId}
                    onValueChange={(v) => {
                      const updated = [...auxiliaryTechnicians];
                      updated[index] = v;
                      setAuxiliaryTechnicians(updated);
                    }}
                    placeholder="Técnico de apoyo"
                    searchPlaceholder="Buscar técnico..."
                    triggerClassName="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar técnico de apoyo"
                    className="text-destructive"
                    onClick={() => {
                      const updated = auxiliaryTechnicians.filter((_, i) => i !== index);
                      setAuxiliaryTechnicians(updated);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAuxiliaryTechnicians([...auxiliaryTechnicians, ''])}
                className="w-full border-dashed bg-transparent"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Añadir apoyo
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isProcessing}>
            {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

