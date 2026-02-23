'use client';

/**
 * BB Maintenance - Admin Horarios Page
 * Gestion de horarios de tecnicos
 * Componente React puro (sin dependencias de Next.js)
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_WORK_SHIFTS, GET_TECHNICIANS, CREATE_WORK_SHIFT, DELETE_WORK_SHIFT } from '@/lib/graphql/queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScheduleSkeleton } from '@/components/ui/skeleton-loaders';
import { Calendar, Clock, Plus, Trash2, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { User, WorkShift } from '@/lib/types';

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getWeekDates(baseDate: Date) {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function HorariosPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newShift, setNewShift] = useState({
    technicianId: '',
    date: '',
    startTime: '08:00',
    endTime: '16:00',
    notes: '',
  });

  const weekDates = getWeekDates(currentWeek);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data: shiftsData, loading: shiftsLoading, refetch } = useQuery<{
    workShifts: WorkShift[];
  }>(GET_WORK_SHIFTS, {
    variables: { startDate, endDate },
  });

  const { data: techData, loading: techLoading } = useQuery<{
    technicians: User[];
  }>(GET_TECHNICIANS);

  const [createShift, { loading: creating }] = useMutation(CREATE_WORK_SHIFT);
  const [deleteShift] = useMutation(DELETE_WORK_SHIFT);

  const shifts = shiftsData?.workShifts || [];
  const technicians = techData?.technicians || [];

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const handleCreateShift = async () => {
    if (!newShift.technicianId || !newShift.date) return;

    try {
      await createShift({
        variables: { input: newShift },
      });
      setAddDialogOpen(false);
      setNewShift({ technicianId: '', date: '', startTime: '08:00', endTime: '16:00', notes: '' });
      refetch();
    } catch {
      // Error handled silently
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShift({ variables: { id: shiftId } });
      refetch();
    } catch {
      // Error handled silently
    }
  };

  const getShiftsForDate = (date: string) => {
    return shifts.filter((s) => s.date === date);
  };

  const isLoading = shiftsLoading || techLoading;

  if (isLoading) return <ScheduleSkeleton />;

  const weekLabel = `${new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Horarios de Tecnicos</h1>
          <p className="text-muted-foreground">Gestione los turnos y horarios del equipo</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Turno
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="bg-card border-border">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{weekLabel}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, idx) => (
          <div key={day} className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">{day}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(weekDates[idx]).toLocaleDateString('es-ES', { day: 'numeric' })}
            </p>
          </div>
        ))}
        {weekDates.map((date) => {
          const dayShifts = getShiftsForDate(date);
          const isToday = date === new Date().toISOString().split('T')[0];

          return (
            <Card key={date} className={`bg-card border-border min-h-[100px] ${isToday ? 'border-primary/50' : ''}`}>
              <CardContent className="p-2">
                {dayShifts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin turnos</p>
                ) : (
                  <div className="space-y-1">
                    {dayShifts.map((shift) => (
                      <div key={shift.id} className="rounded bg-primary/10 p-1.5 group relative">
                        <p className="text-xs font-medium text-primary truncate">
                          {shift.technician?.name || 'Tecnico'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shift.startTime} - {shift.endTime}
                        </p>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Eliminar turno"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Technicians Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            Resumen de Tecnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {technicians.map((tech) => {
              const techShifts = shifts.filter((s) => s.technicianId === tech.id);
              return (
                <div key={tech.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.department}</p>
                  </div>
                  <Badge variant="secondary">{techShifts.length} turnos</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Turno</DialogTitle>
            <DialogDescription>Complete los datos para crear un nuevo turno</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tecnico</Label>
              <Select value={newShift.technicianId} onValueChange={(v) => setNewShift((p) => ({ ...p, technicianId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tecnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={newShift.date} onChange={(e) => setNewShift((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio</Label>
                <Input type="time" value={newShift.startTime} onChange={(e) => setNewShift((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora Fin</Label>
                <Input type="time" value={newShift.endTime} onChange={(e) => setNewShift((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea value={newShift.notes} onChange={(e) => setNewShift((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-transparent">Cancelar</Button>
            <Button onClick={handleCreateShift} disabled={creating || !newShift.technicianId || !newShift.date}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Crear Turno
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HorariosPage;
