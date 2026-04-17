import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { cn } from '@/lib/utils';
import {
    GetWeekScheduleDocument,
    GetScheduleTechniciansDocument,
    GetAbsenceReasonsActiveDocument,
    GetShiftsDocument,
    AssignWeekScheduleDocument,
    CopyWeekSchedulesDocument,
    ScheduleItemFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';
import { normalizeDate } from '@/lib/utils/scheduling';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleSkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from '@/components/ui/input';
import { Calendar, Save, Copy, ChevronLeft, ChevronRight, Loader2, Filter, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// --- Utilidades de Fechas (ISO 8601) ---
function getISOWeekInfo(date: Date): { year: number; weekNumber: number } {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return { year: target.getFullYear(), weekNumber };
}

function getWeekDates(baseDate: Date): string[] {
    // Setear hora local a las 12:00PM para evitar saltos de día al convertir
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff); // Se posiciona en Lunes

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        // Extracción manual local YYYY-MM-DD sin toISOString()
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${dayOfMonth}`);
    }

    return dates; 
}

type CellValue = { type: 'SHIFT' | 'ABSENCE' | 'EMPTY'; id: string };
type TechnicianScheduleMap = Record<string, Record<string, CellValue>>;

export default function SchedulePage() {

    // --- Estados Principales ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const { year, weekNumber } = useMemo(() => getISOWeekInfo(currentDate), [currentDate]);
    const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

    // Matriz de estado local: { technicianId: { "2026-02-24": { type: "SHIFT", id: "123" } } }
    const [localMatrix, setLocalMatrix] = useState<TechnicianScheduleMap>({});
    const [modifiedTechs, setModifiedTechs] = useState<Set<string>>(new Set());

    // Filtros
    const [filterShift, setFilterShift] = useState<string>('ALL');
    const [filterDay, setFilterDay] = useState<string>('ALL');
    const [filterName, setFilterName] = useState<string>('');
    const [filterPosition, setFilterPosition] = useState<string>('ALL');

    // --- Queries ---
    const { data: weekData, loading: weekLoading, refetch: refetchWeek } = useOfflineAwareQuery(GetWeekScheduleDocument, {
        variables: { weekNumber, year },
        onlinePolicy: 'network-only',
    });
    const { data: techData, loading: techLoading } = useQuery(GetScheduleTechniciansDocument);
    const { data: absData } = useQuery(GetAbsenceReasonsActiveDocument);
    const { data: shiftData } = useQuery(GetShiftsDocument);

    // --- Mutaciones ---
    const [assignWeek] = useMutation(AssignWeekScheduleDocument);
    const [copyWeek, { loading: copying }] = useMutation(CopyWeekSchedulesDocument);

    const [isSaving, setIsSaving] = useState(false);
    const [pendingNavDirection, setPendingNavDirection] = useState<number | null>(null);
    const [showCopyConfirm, setShowCopyConfirm] = useState(false);

    const rawSchedules = useFragment(
        ScheduleItemFragmentDoc,
        weekData?.weekSchedule?.schedules ?? []
    );

    // Derive a content-based key so the effect fires on actual data changes,
    // not just object reference changes (which useFragment may keep stable).
    const schedulesKey = useMemo(() => {
        return rawSchedules
            .map(s => `${s.technicianId}|${normalizeDate(s.scheduleDate)}|${s.shiftId ?? ''}|${s.absenceReasonId ?? ''}`)
            .sort()
            .join(';');
    }, [rawSchedules]);

    useEffect(() => {
        const newMatrix: TechnicianScheduleMap = {};
        rawSchedules.forEach(schedule => {
            const userId = schedule.technicianId;
            const dStr = normalizeDate(schedule.scheduleDate);

            if (!newMatrix[userId]) newMatrix[userId] = {};

            if (schedule.shiftId) {
                newMatrix[userId][dStr] = { type: 'SHIFT', id: schedule.shiftId };
            } else if (schedule.absenceReasonId) {
                newMatrix[userId][dStr] = { type: 'ABSENCE', id: schedule.absenceReasonId };
            }
        });
        setLocalMatrix(newMatrix);
        setModifiedTechs(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schedulesKey, weekNumber, year]);

    // --- Handlers de UI ---
    const applyNavigation = (direction: number) => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + direction * 7);
        setCurrentDate(next);
        setModifiedTechs(new Set());
    };

    const navigateWeek = (direction: number) => {
        if (modifiedTechs.size > 0) {
            setPendingNavDirection(direction);
            return;
        }
        applyNavigation(direction);
    };

    // userId here is tech.user.id — the key used in localMatrix and the backend's technicianId
    const handleCellChange = (userId: string, dateStr: string, value: string) => {
        setLocalMatrix(prev => {
            const techRecord = { ...(prev[userId] || {}) };

            if (!value) {
                delete techRecord[dateStr];
            } else {
                const [type, id] = value.split(':');
                techRecord[dateStr] = { type: type as 'SHIFT' | 'ABSENCE', id };
            }

            return { ...prev, [userId]: techRecord };
        });

        setModifiedTechs(prev => new Set(prev).add(userId));
    };

    // --- Lógica de Guardado Masivo ---
    const handleSave = async () => {
        if (modifiedTechs.size === 0) return;
        setIsSaving(true);

        const activeAbsences = absData?.absenceReasonsActive || [];

        try {
            // modifiedTechs stores user.id (technicianId in the backend sense)
            const promises = Array.from(modifiedTechs).map(async (userId) => {
                const techSchedule = localMatrix[userId] || {};

                const counts: Record<string, number> = {};
                const daysPayload: Array<{ scheduleDate: string; shiftId?: string; absenceReasonId?: string }> = [];

                weekDates.forEach(dateStr => {
                    const cell = techSchedule[dateStr];
                    if (!cell) return; // Skip days with no assignment ("Libre")

                    if (cell.type === 'ABSENCE') {
                        counts[cell.id] = (counts[cell.id] || 0) + 1;
                    }
                    daysPayload.push({
                        scheduleDate: dateStr,
                        shiftId: cell.type === 'SHIFT' ? cell.id : undefined,
                        absenceReasonId: cell.type === 'ABSENCE' ? cell.id : undefined,
                    });
                });

                for (const [absId, count] of Object.entries(counts)) {
                    const reason = activeAbsences.find(a => a.id === absId);
                    if (reason?.maxPerWeek && count > reason.maxPerWeek) {
                        throw new Error(`El técnico excede el límite de '${reason.name}' (${reason.maxPerWeek} máx por semana). Revise e intente de nuevo.`);
                    }
                }

                return assignWeek({
                    variables: {
                        input: {
                            technicianId: userId,
                            weekNumber,
                            year,
                            days: daysPayload
                        }
                    }
                });
            });

            await Promise.all(promises);
            setModifiedTechs(new Set());
            await refetchWeek();
            toast.success("Horarios guardados exitosamente.");

        } catch {
            toast.error("Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Copiar Semana Anterior ---
    const handleCopyPrevious = () => {
        setShowCopyConfirm(true);
    };

    const confirmCopyPrevious = async () => {
        setShowCopyConfirm(false);
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 7);
        const prevISO = getISOWeekInfo(prevDate);

        try {
            await copyWeek({
                variables: {
                    input: {
                        sourceWeekNumber: prevISO.weekNumber,
                        sourceYear: prevISO.year,
                        targetWeekNumber: weekNumber,
                        targetYear: year
                    }
                }
            });
            await refetchWeek();
            toast.success("Semana copiada exitosamente.");
        } catch {
            toast.error("Error al copiar la semana.");
        }
    };

    // --- Preparar datos para render ---
    const isLoading = weekLoading || techLoading;
    // Solo técnicos activos pueden recibir horarios
    const technicians = (techData?.techniciansWithDeleted || []).filter((t: { isActive?: boolean }) => t.isActive);
    const shifts = shiftData?.shiftsActive || [];
    const absences = absData?.absenceReasonsActive || [];

    const positionOptions = useMemo(() => {
        const unique = new Set(technicians.map((t: { position: { name: string } }) => t.position.name));
        return Array.from(unique).sort() as string[];
    }, [technicians]);

    const hasActiveFilters = filterName !== '' || filterPosition !== 'ALL' || filterDay !== 'ALL' || filterShift !== 'ALL';

    const clearFilters = () => {
        setFilterName('');
        setFilterPosition('ALL');
        setFilterDay('ALL');
        setFilterShift('ALL');
    };

    // Aplicar Filtros (nombre, puesto, día y turno)
    const filteredTechnicians = technicians.filter((tech: { user: { id: string; fullName: string; employeeNumber: string }; position: { name: string } }) => {
        const uid = tech.user.id;

        // Filtro por nombre o número de empleado
        const nameQuery = filterName.trim().toLowerCase();
        if (nameQuery) {
            const matchName = tech.user.fullName.toLowerCase().includes(nameQuery);
            const matchEmp = tech.user.employeeNumber.toLowerCase().includes(nameQuery);
            if (!matchName && !matchEmp) return false;
        }

        // Filtro por puesto
        if (filterPosition !== 'ALL' && tech.position.name !== filterPosition) return false;

        // Filtro por día y turno
        if (filterDay === 'ALL' && filterShift === 'ALL') return true;

        if (filterDay !== 'ALL') {
            const cell = localMatrix[uid]?.[filterDay];
            if (filterShift === 'ALL') {
                return cell?.type === 'SHIFT';
            } else {
                return cell?.type === 'SHIFT' && cell.id === filterShift;
            }
        }

        if (filterShift !== 'ALL') {
            return weekDates.some(d => localMatrix[uid]?.[d]?.type === 'SHIFT' && localMatrix[uid]?.[d]?.id === filterShift);
        }
        return true;
    });

    const weekLabel = `${new Date(weekDates[0] + "T12:00:00").toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(weekDates[6] + "T12:00:00").toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    if (isLoading && !weekData) return <ScheduleSkeleton />;

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Horarios</h1>
                    <p className="text-muted-foreground">Asignación masiva semanal para técnicos</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={handleCopyPrevious} disabled={copying || isSaving} className="bg-background shadow-sm">
                        {copying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                        Copiar Semana Anterior
                    </Button>
                    <Button onClick={handleSave} disabled={modifiedTechs.size === 0 || isSaving} className="shadow-sm">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios {modifiedTechs.size > 0 && `(${modifiedTechs.size})`}
                    </Button>
                </div>
            </div>

            {/* Navegación y Filtros */}
            <Card className="bg-card border-border shadow-sm">
                <CardContent className="py-5 px-5 space-y-4">
                    {/* Fila 1: Navegador de Semanas (ancho completo) */}
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg p-1 border border-border/50">
                        <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)} disabled={isSaving}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 px-4">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div className="text-center">
                                <p className="font-semibold text-sm text-foreground leading-none">Semana {weekNumber}</p>
                                <p className="text-xs text-muted-foreground mt-1">{weekLabel}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)} disabled={isSaving}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Fila 2: Filtros en cuadrícula */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Buscar técnico */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Buscar técnico..."
                                className="h-10 pl-9 bg-background"
                            />
                        </div>

                        {/* Filtrar por puesto */}
                        <UISelect value={filterPosition} onValueChange={setFilterPosition}>
                            <SelectTrigger className="h-10 bg-background">
                                <SelectValue placeholder="Todos los Puestos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Puestos</SelectItem>
                                {positionOptions.map(pos => (
                                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                ))}
                            </SelectContent>
                        </UISelect>

                        {/* Filtrar por turno */}
                        <UISelect value={filterShift} onValueChange={setFilterShift}>
                            <SelectTrigger className="h-10 bg-background">
                                <SelectValue placeholder="Todos los Turnos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Turnos</SelectItem>
                                {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </UISelect>

                        {/* Filtrar por día */}
                        <div className="flex gap-2">
                            <UISelect value={filterDay} onValueChange={setFilterDay}>
                                <SelectTrigger className="h-10 bg-background flex-1">
                                    <Filter className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                                    <SelectValue placeholder="Todos los Días" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos los Días</SelectItem>
                                    {weekDates.map((date, i) => (
                                        <SelectItem key={date} value={date}>{DAYS[i]} {new Date(date + "T12:00:00").getDate()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </UISelect>
                            {hasActiveFilters && (
                                <Button variant="outline" size="icon" onClick={clearFilters} title="Limpiar filtros" className="h-10 w-10 shrink-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Grid de Alta Eficiencia */}
            <Card className="bg-card border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-semibold sticky left-0 bg-muted/90 backdrop-blur-sm z-10 border-r border-border min-w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    Técnico
                                </th>
                                {weekDates.map((date, i) => (
                                    <th key={date} className="px-3 py-3 font-semibold text-center min-w-[140px]">
                                        <div className="flex flex-col items-center">
                                            <span>{DAYS[i]}</span>
                                            <span className="text-foreground text-lg">{new Date(date + "T12:00:00").getDate()}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredTechnicians.map(tech => {
                                const uid = tech.user.id;
                                const isModified = modifiedTechs.has(uid);
                                return (
                                    <tr key={tech.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-4 py-3 sticky left-0 bg-card group-hover:bg-muted/10 z-10 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isModified ? 'bg-warning animate-pulse' : 'bg-transparent'}`} title="Modificado sin guardar" />
                                                <div>
                                                    <p className="font-medium text-foreground">{tech.user.fullName}</p>
                                                    <p className="text-[10px] text-muted-foreground">{tech.position.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {weekDates.map(dateStr => {
                                            const cell = localMatrix[uid]?.[dateStr];
                                            const currentValue = cell ? `${cell.type}:${cell.id}` : '';

                                            return (
                                                <td key={dateStr} className="px-2 py-2">
                                                    <select
                                                        value={currentValue}
                                                        onChange={(e) => handleCellChange(uid, dateStr, e.target.value)}
                                                        className={cn(
                                                            "w-full h-9 text-xs rounded-md border px-2 py-1 outline-none transition-colors appearance-none cursor-pointer",
                                                            cell?.type === 'SHIFT'
                                                                ? 'bg-primary/15 border-primary/30 text-primary font-medium dark:bg-primary/30 dark:border-primary/50'
                                                                : cell?.type === 'ABSENCE'
                                                                    ? 'bg-destructive/15 border-destructive/30 text-destructive font-medium dark:bg-destructive/30 dark:border-destructive/50'
                                                                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                                                        )}
                                                    >
                                                        <option value="">-- Libre --</option>
                                                        <optgroup label="Turnos Laborales">
                                                            {shifts.map(s => (
                                                                <option key={`SHIFT:${s.id}`} value={`SHIFT:${s.id}`}>{s.name} ({s.startTime.slice(0, 5)})</option>
                                                            ))}
                                                        </optgroup>
                                                        <optgroup label="Ausencias">
                                                            {absences.map(a => (
                                                                <option key={`ABSENCE:${a.id}`} value={`ABSENCE:${a.id}`}>{a.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ─── Confirmación: Cambiar semana con cambios pendientes ── */}
            <AlertDialog open={pendingNavDirection !== null} onOpenChange={(open) => !open && setPendingNavDirection(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tienes cambios sin guardar en los horarios. Si cambias de semana se perderán. ¿Deseas descartar los cambios y continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { applyNavigation(pendingNavDirection!); setPendingNavDirection(null); }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Descartar y continuar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ─── Confirmación: Copiar semana anterior ──────────────── */}
            <AlertDialog open={showCopyConfirm} onOpenChange={setShowCopyConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Copiar semana anterior?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Los horarios actuales serán reemplazados con los de la semana pasada. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCopyPrevious}>
                            Copiar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}