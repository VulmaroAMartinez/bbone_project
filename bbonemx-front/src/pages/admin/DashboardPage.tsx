import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { GetDashboardDataDocument, GetShiftsDocument, type WorkOrderStatus } from '@/lib/graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import {
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
  Users,
  PlusCircle,
  FileDown,
  CalendarClock,
  OctagonAlert,
  LayoutList,
  Timer,
  Pause,
  CheckCheck,
  Wrench,
  Ban,
  ClipboardCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDateRange } from '@/lib/utils';
import { toast } from 'sonner';
import { captureElementToJpegDataUrl } from '@/lib/utils/capture-chart-for-pdf';
import { getApiBaseUrl } from '@/lib/utils/uploads';
import { downloadBlob } from '@/lib/utils/excel-download';

const tooltipStyle = {
  backgroundColor: 'oklch(0.17 0.005 260)',
  border: '1px solid oklch(0.28 0.005 260)',
  borderRadius: '8px',
  color: 'oklch(0.97 0 0)',
};

// Traducciones para los tipos de Mantenimiento
const TYPE_LABELS: Record<string, string> = {
  CORRECTIVE_EMERGENT: 'Emergente',
  CORRECTIVE_SCHEDULED: 'Programado',
  PREVENTIVE: 'Preventivo',
  FINDING: 'Hallazgo',
  UNSPECIFIED: 'No Espec.'
};

const TYPE_COLORS: Record<string, string> = {
  CORRECTIVE_EMERGENT: '#e62923',
  CORRECTIVE_SCHEDULED: '#f59e0b',
  PREVENTIVE: '#229877',
  FINDING: '#3b82f6',
  UNSPECIFIED: '#888888'
};

const FINDINGS_AREA_COLORS = [
  '#f59e0b', // amber
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ef4444', // red
  '#14b8a6', // teal
  '#eab308', // yellow
] as const;

const WORK_ORDERS_AREA_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f97316', // orange
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ef4444', // red
  '#84cc16', // lime
  '#e11d48', // rose
] as const;

const WO_STATUS_OPTIONS: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'PENDING' as WorkOrderStatus, label: 'Pendientes' },
  { value: 'IN_PROGRESS' as WorkOrderStatus, label: 'En Progreso' },
  { value: 'PAUSED' as WorkOrderStatus, label: 'En Pausa' },
  { value: 'COMPLETED' as WorkOrderStatus, label: 'Completadas' },
  { value: 'TEMPORARY_REPAIR' as WorkOrderStatus, label: 'Rep. Temporal' },
];

const ALL_STATUSES: WorkOrderStatus[] = [
  'PENDING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'COMPLETED', 'TEMPORARY_REPAIR', 'CANCELLED',
] as WorkOrderStatus[];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:          { label: 'Pendientes',    color: 'text-amber-500',   icon: <Timer className="h-4 w-4 text-amber-500" /> },
  IN_PROGRESS:      { label: 'En Progreso',   color: 'text-blue-500',    icon: <Activity className="h-4 w-4 text-blue-500" /> },
  PAUSED:           { label: 'En Pausa',      color: 'text-orange-500',  icon: <Pause className="h-4 w-4 text-orange-500" /> },
  FINISHED:         { label: 'Finalizadas',   color: 'text-teal-500',    icon: <CheckCheck className="h-4 w-4 text-teal-500" /> },
  COMPLETED:        { label: 'Completadas',   color: 'text-green-500',   icon: <ClipboardCheck className="h-4 w-4 text-green-500" /> },
  TEMPORARY_REPAIR: { label: 'Rep. Temporal', color: 'text-yellow-500',  icon: <Wrench className="h-4 w-4 text-yellow-500" /> },
  CANCELLED:        { label: 'Canceladas',    color: 'text-red-500',     icon: <Ban className="h-4 w-4 text-red-500" /> },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const VALID_PRESETS = ['today', '7d', '30d', 'this_month', 'this_year'];
  const initialPreset = searchParams.get('range');
  const [rangePreset, setRangePreset] = useState(
    initialPreset && VALID_PRESETS.includes(initialPreset) ? initialPreset : '30d'
  );
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [woStatusFilter, setWoStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [exportingCharts, setExportingCharts] = useState(false);

  const refThroughput = useRef<HTMLDivElement>(null);
  const refMix = useRef<HTMLDivElement>(null);
  const refActivitiesResponsible = useRef<HTMLDivElement>(null);
  const refTechnicians = useRef<HTMLDivElement>(null);
  const refMachinesDowntime = useRef<HTMLDivElement>(null);
  const refFindingsArea = useRef<HTMLDivElement>(null);
  const refWorkOrdersArea = useRef<HTMLDivElement>(null);

  const currentRange = useMemo(() => {
    return getDateRange(rangePreset as Parameters<typeof getDateRange>[0]);
  }, [rangePreset]);

  const { data: shiftsData } = useQuery(GetShiftsDocument);

  const { data, loading, error } = useOfflineAwareQuery(GetDashboardDataDocument, {
    variables: {
      input: {
        dateFrom: currentRange.dateFrom,
        dateTo: currentRange.dateTo,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City',
        shiftIds: shiftFilter !== 'all' ? [shiftFilter] : undefined,
        woStatuses: woStatusFilter !== 'all' ? [woStatusFilter] : undefined,
      }
    },
  });

  const handleRangeChange = (value: string) => {
    setRangePreset(value);
    setSearchParams({ range: value });
  };

  const rangeLabels: Record<string, string> = {
    'today': 'Hoy',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    'this_month': 'Este mes',
    'this_year': 'Este año',
  };

  const handleExportChartsPdf = async () => {
    if (!data?.dashboardData) {
      toast.error('Espera a que carguen las gráficas');
      return;
    }
    const specs: Array<{ el: HTMLDivElement | null; title: string }> = [
      { el: refActivitiesResponsible.current, title: 'Actividades por Responsable' },
      { el: refThroughput.current, title: 'Tendencia de Órdenes de Trabajo' },
      { el: refTechnicians.current, title: 'Top Técnicos por Cierres' },
      { el: refMachinesDowntime.current, title: 'Top Máquinas (Tiempo Muerto)' },
      { el: refFindingsArea.current, title: 'Hallazgos por Área' },
      { el: refWorkOrdersArea.current, title: 'Órdenes de Trabajo por Área' },
    ];

    setExportingCharts(true);
    try {
      const items: { title: string; imageDataUrl: string }[] = [];
      for (const { el, title } of specs) {
        if (!el) continue;
        const imageDataUrl = await captureElementToJpegDataUrl(el, {
          quality: 0.9,
          pixelRatio: 2,
        });
        items.push({ title, imageDataUrl });
      }
      if (items.length === 0) {
        toast.error('No se pudieron capturar las gráficas');
        return;
      }

      const subtitle = `${rangeLabels[rangePreset] ?? 'Periodo'} · ${currentRange.dateFrom} al ${currentRange.dateTo}`;
      const filename = `dashboard-graficas-${new Date().toISOString().slice(0, 10)}.pdf`;

      const response = await fetch(`${getApiBaseUrl()}/api/dashboard/export/charts-pdf`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: 'Dashboard — Gráficas',
          subtitle,
          filename,
          items,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      downloadBlob(blob, filename);
      toast.success('PDF descargado correctamente');
    } catch (e) {
      toast.error(
        `Error al exportar PDF: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setExportingCharts(false);
    }
  };

  const dashboardData = data?.dashboardData;

  // Agrupación para PieChart del Maintenance Mix (el backend lo da por periodo, nosotros lo sumamos total para el pastel)
  const maintenanceMixPieData = useMemo(() => {
    const byPeriod = dashboardData?.charts?.maintenanceMixByPeriod ?? [];
    const totals: Record<string, number> = {};

    byPeriod.forEach((item) => {
      const type = item.type;
      totals[type] = (totals[type] || 0) + item.count;
    });

    return Object.entries(totals).map(([key, value]) => ({
      name: TYPE_LABELS[key] || key,
      value,
      color: TYPE_COLORS[key] || '#888',
    }));
  }, [dashboardData?.charts?.maintenanceMixByPeriod]);

  const topMachinesByDowntime = useMemo(() => {
    const list = dashboardData?.rankings?.topMachinesByDowntime ?? [];
    return list.filter((m) => (m?.value ?? 0) > 0);
  }, [dashboardData?.rankings?.topMachinesByDowntime]);

  const findingsByAreaColored = useMemo(() => {
    const list = dashboardData?.charts?.findingsByArea ?? [];
    return list.map((item, index) => ({
      ...item,
      __color: FINDINGS_AREA_COLORS[index % FINDINGS_AREA_COLORS.length],
    }));
  }, [dashboardData?.charts?.findingsByArea]);

  const workOrdersByAreaColored = useMemo(() => {
    const list = dashboardData?.charts?.workOrdersByArea ?? [];
    return list.map((item, index) => ({
      ...item,
      __color: WORK_ORDERS_AREA_COLORS[index % WORK_ORDERS_AREA_COLORS.length],
    }));
  }, [dashboardData?.charts?.workOrdersByArea]);

  if (loading && !data) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar el Dashboard</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const { kpis, charts, rankings } = data!.dashboardData;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Métricas de Mantenimiento</h1>
          <p className="text-muted-foreground text-sm">
            {rangeLabels[rangePreset] ?? 'Rango personalizado'} ({currentRange.dateFrom} al {currentRange.dateTo})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Select value={rangePreset} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="this_month">Este mes</SelectItem>
              <SelectItem value="this_year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los turnos</SelectItem>
              {(shiftsData?.shiftsActive || []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={woStatusFilter} onValueChange={(v) => setWoStatusFilter(v as WorkOrderStatus | 'all')}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Estado OT" />
            </SelectTrigger>
            <SelectContent>
              {WO_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={loading || exportingCharts || !data?.dashboardData}
            onClick={() => void handleExportChartsPdf()}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {exportingCharts ? 'Generando PDF...' : 'Exportar PDF (gráficas)'}
          </Button>
          <Button onClick={() => navigate('/admin/ordenes')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Explorar Órdenes
          </Button>
        </div>
      </div>

      {/* Fila 1 — Totales y alertas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total OTs</CardTitle>
            <LayoutList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpis.totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencen Hoy</CardTitle>
            <CalendarClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500 tabular-nums">{kpis.dueToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Correc. programadas para hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retrasadas</CardTitle>
            <OctagonAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive tabular-nums">{kpis.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Correc. programadas vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Fila 2 — Por status (7 tarjetas) */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
        {ALL_STATUSES.map((status) => {
          const meta = STATUS_META[status];
          const count = kpis.countByStatus.find((s) => s.status === status)?.count ?? 0;
          return (
            <Card key={status} className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{meta.label}</CardTitle>
                {meta.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold tabular-nums ${meta.color}`}>{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficas nuevas — Actividades por Responsable + Tendencia OTs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card ref={refActivitiesResponsible} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Actividades por Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras dobles de actividades totales vs con fecha fin por responsable">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={charts.activitiesByResponsible}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" />
                <XAxis
                  dataKey="responsibleName"
                  stroke="oklch(0.65 0 0)"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={55}
                />
                <YAxis stroke="oklch(0.65 0 0)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="totalActivities" name="Total actividades" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activitiesWithEndDate" name="Con fecha fin" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tendencia OTs (Throughput) */}
        <Card ref={refThroughput} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Tendencia de Órdenes de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de tendencia semanal de órdenes de trabajo cerradas">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <LineChart data={charts.throughputByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" />
                  <XAxis dataKey="period" stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.65 0 0)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="count" name="OTs Cerradas" stroke="#229877" strokeWidth={2} dot={{ fill: '#229877', r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mix de Mantenimiento + Rankings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Mix de Mantenimiento */}
        <Card ref={refMix} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Mix de Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de pastel con el mix de tipos de mantenimiento">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <PieChart>
                  <Pie
                    data={maintenanceMixPieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {maintenanceMixPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: tooltipStyle.color }}
                    itemStyle={{ color: tooltipStyle.color }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversión de Hallazgos */}
        {(() => {
          const conv = charts.findingsConversion;
          const rate = conv.find((k) => k.key === 'convertedRate')?.value ?? 0;
          const total = conv.find((k) => k.key === 'totalFindings')?.value ?? 0;
          const converted = conv.find((k) => k.key === 'convertedFindings')?.value ?? 0;
          return (
            <Card className="bg-card border-border shadow-sm flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-base">
                  <ArrowRight className="h-4 w-4 text-primary" /> Conversión de Hallazgos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tasa de conversión</p>
                  <div className="text-5xl font-bold tabular-nums text-primary">{rate.toFixed(1)}<span className="text-2xl font-normal text-muted-foreground">%</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Hallazgos convertidos a OT</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total hallazgos</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">{total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Convertidos</p>
                    <p className="text-2xl font-bold tabular-nums text-green-500">{converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Rankings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Técnicos */}
        <Card ref={refTechnicians} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Top Técnicos por Cierres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras con los técnicos con más órdenes completadas">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <BarChart data={rankings.topTechniciansByClosures} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.65 0 0)" />
                  <YAxis dataKey="technicianName" type="category" stroke="oklch(0.65 0 0)" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="OTs Completadas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Máquinas por Downtime */}
        <Card ref={refMachinesDowntime} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Top Máquinas (Tiempo Muerto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras con las máquinas con mayor tiempo muerto">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <BarChart data={topMachinesByDowntime} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.65 0 0)" />
                  <YAxis dataKey="machineName" type="category" stroke="oklch(0.65 0 0)" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val} min`, 'Downtime']} />
                  <Bar dataKey="value" fill="#dc2626" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hallazgos y OTs por Área */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card ref={refFindingsArea} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Hallazgos por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras con número de hallazgos por área">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={findingsByAreaColored}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" />
                <XAxis dataKey="areaName" stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} />
                <YAxis stroke="oklch(0.65 0 0)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Hallazgos" radius={[4, 4, 0, 0]}>
                  {findingsByAreaColored.map((entry, index) => (
                    <Cell
                      key={`finding-area-cell-${index}`}
                      fill={String((entry as unknown as { __color?: string }).__color ?? '#888')}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card ref={refWorkOrdersArea} className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" /> Órdenes de Trabajo por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras con número de órdenes de trabajo por área">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={workOrdersByAreaColored}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" />
                <XAxis dataKey="areaName" stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} />
                <YAxis stroke="oklch(0.65 0 0)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="OTs" radius={[4, 4, 0, 0]}>
                  {workOrdersByAreaColored.map((entry, index) => (
                    <Cell
                      key={`wo-area-cell-${index}`}
                      fill={String((entry as unknown as { __color?: string }).__color ?? '#888')}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions (Manteniendo el menú original útil) */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/admin/crear-ot')}>
              <PlusCircle className="h-5 w-5" />
              <span className="text-xs">Crear OT</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/hallazgos/nuevo')}>
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Crear Hallazgo</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/tecnicos')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Técnicos</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/admin/ordenes')}>
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs">Todas las OT</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}