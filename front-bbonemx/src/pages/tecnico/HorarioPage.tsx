'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/contexts/auth-context';
import { GET_WORK_SHIFTS } from '@/lib/graphql/queries';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import type { WorkShift } from '@/lib/types';

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getShiftColor(type: string): string {
  switch (type) {
    case 'manana':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'tarde':
      return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
    case 'noche':
      return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export default function HorarioPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, loading } = useQuery(GET_WORK_SHIFTS, {
    variables: { technicianId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const workShifts: WorkShift[] = data?.workShifts || [];
  const weekDates = useMemo(() => getWeekDates(new Date(currentDate)), [currentDate]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('es-MX', opts)} - ${end.toLocaleDateString('es-MX', opts)}, ${end.getFullYear()}`;
  }, [weekDates]);

  const changeWeek = (direction: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + direction * 7);
    setCurrentDate(next);
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workShifts.filter((s) => s.date === dateStr);
  };

  if (loading) {
    return (
      <AppShell>
        <WorkOrderListSkeleton count={3} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Horario</h1>
          <p className="text-muted-foreground">Calendario semanal de turnos asignados</p>
        </div>

        {/* Week navigation */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{weekLabel}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Week grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          {weekDates.map((date, idx) => {
            const shifts = getShiftsForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <Card
                key={date.toISOString()}
                className={`bg-card ${isToday ? 'border-primary ring-1 ring-primary/30' : ''}`}
              >
                <CardHeader className="pb-2 pt-4 px-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className={isToday ? 'text-primary font-bold' : 'text-muted-foreground'}>
                      {DAYS[idx]}
                    </span>
                    <span
                      className={`text-lg ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}
                    >
                      {date.getDate()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  {shifts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Libre</p>
                  ) : (
                    <div className="space-y-2">
                      {shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`rounded-md border px-2 py-1.5 text-xs ${getShiftColor(shift.type)}`}
                        >
                          <div className="font-medium capitalize">{shift.type}</div>
                          <div className="flex items-center gap-1 mt-0.5 opacity-80">
                            <Clock className="h-3 w-3" />
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground font-medium">Tipos de turno:</span>
              <Badge variant="outline" className={getShiftColor('manana')}>
                Manana
              </Badge>
              <Badge variant="outline" className={getShiftColor('tarde')}>
                Tarde
              </Badge>
              <Badge variant="outline" className={getShiftColor('noche')}>
                Noche
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
