import { useState, useMemo } from 'react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useAuth } from '@/hooks/useAuth';

// Imports Generados
import {
    GetTechnicianWeekScheduleDocument,
    ScheduleItemFragmentDoc
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Utilidad para obtener Año y Número de Semana (Estándar ISO 8601)
function getISOWeekInfo(date: Date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return { year: target.getFullYear(), weekNumber };
}

// Utilidad para obtener los 7 días (Date) de la semana actual
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

export default function TechSchedulePage() {
    const { user } = useAuth();

    // Estado que controla la fecha pivote que estamos viendo
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculamos la semana y el año de la fecha pivote
    const { year, weekNumber } = useMemo(() => getISOWeekInfo(currentDate), [currentDate]);
    const weekDates = useMemo(() => getWeekDates(new Date(currentDate)), [currentDate]);

    // Query al Backend
    const { data, loading, error, isOffline } = useOfflineAwareQuery(GetTechnicianWeekScheduleDocument, {
        variables: {
            technicianId: user?.id || '',
            weekNumber,
            year
        },
        skip: !user?.id,
    });

    // Desenmascarar los datos de la semana
    const schedules = useFragment(ScheduleItemFragmentDoc, data?.technicianWeekSchedule || []);

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

    // Función para encontrar el horario o ausencia de un día específico
    const getScheduleForDay = (date: Date) => {
        // Formateamos la fecha local a YYYY-MM-DD para comparar con el backend sin afectar zonas horarias
        const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        return schedules.find((s) => {
            // El backend devuelve DateTime (ej. 2026-02-24T00:00:00.000Z), comparamos los primeros 10 caracteres
            const scheduleDateStr = s.scheduleDate.split('T')[0];
            return scheduleDateStr === localDateStr;
        });
    };

    if (loading && !data) return <WorkOrderListSkeleton count={3} />;

    if (error && !data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold text-foreground">Error al cargar el horario</h2>
                <p className="text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {isOffline && data && <OfflineBanner />}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Mi Horario de Trabajo</h1>
                <p className="text-muted-foreground">Calendario semanal de turnos y ausencias asignadas</p>
            </div>

            {/* Navegación de Semanas */}
            <Card className="bg-card shadow-sm border-border">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => changeWeek(-1)}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => changeWeek(1)}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-foreground">{weekLabel}</span>
                            <Badge variant="secondary" className="ml-2">Semana {weekNumber}</Badge>
                        </div>
                        <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>
                            Hoy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cuadrícula de la Semana */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {weekDates.map((date, idx) => {
                    const schedule = getScheduleForDay(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <Card
                            key={date.toISOString()}
                            className={`bg-card transition-all ${isToday ? 'border-primary ring-1 ring-primary shadow-md' : 'shadow-sm border-border/60'}`}
                        >
                            <CardHeader className={`pb-2 pt-3 px-3 border-b ${isToday ? 'bg-primary/5' : 'bg-muted/10'}`}>
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span className={isToday ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}>
                                        {DAYS[idx]}
                                    </span>
                                    <span className={`text-xl ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
                                        {date.getDate()}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 min-h-[100px] flex flex-col justify-center">

                                {!schedule ? (
                                    // Si no hay registro en DB, es día libre
                                    <div className="text-center py-4 bg-muted/20 rounded-md border border-dashed border-border">
                                        <p className="text-sm font-medium text-muted-foreground">Día Libre</p>
                                    </div>
                                ) : schedule.absenceReason ? (
                                    // Si tiene absenceReason, es una falta programada (Vacaciones, etc.)
                                    <div className="rounded-md border px-3 py-2 bg-destructive/10 border-destructive/20 text-center">
                                        <div className="font-semibold text-sm text-destructive">{schedule.absenceReason.name}</div>
                                        {schedule.notes && <div className="text-xs text-destructive/80 mt-1">{schedule.notes}</div>}
                                    </div>
                                ) : schedule.shift ? (
                                    // Si tiene turno, mostramos la tarjeta del turno
                                    <div className="rounded-md border px-3 py-2 bg-primary/10 border-primary/20">
                                        <div className="font-semibold text-sm text-primary capitalize">{schedule.shift.name}</div>
                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-foreground/80 font-medium">
                                            <Clock className="h-3.5 w-3.5 text-primary/70" />
                                            {schedule.shift.startTime} - {schedule.shift.endTime}
                                        </div>
                                        {schedule.notes && <div className="text-xs text-muted-foreground mt-2 italic border-t pt-1">{schedule.notes}</div>}
                                    </div>
                                ) : (
                                    // Fallback
                                    <div className="text-center py-2"><p className="text-xs text-muted-foreground">Error de formato</p></div>
                                )}

                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Leyenda */}
            <Card className="bg-card shadow-sm border-border">
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-muted-foreground font-medium">Nomenclatura:</span>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary/40 border border-primary/50"></div>
                            <span>Turno Laboral</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-destructive/40 border border-destructive/50"></div>
                            <span>Ausencia / Vacaciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-muted border border-border border-dashed"></div>
                            <span>Día Libre (Descanso)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}