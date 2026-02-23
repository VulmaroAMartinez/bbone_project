import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GetDashboardDataDocument } from '@/lib/graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ArrowRight,
  Activity,
  CheckCircle2,
  Users,
  PlusCircle
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
} from 'recharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDateRange } from '@/lib/utils';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentRange, setCurrentRange] = useState(() => getDateRange((searchParams.get('range') as any) || '30d'));


  const { data, loading, error } = useQuery(GetDashboardDataDocument, {
    variables: {
      input: {
        dateFrom: currentRange.dateFrom,
        dateTo: currentRange.dateTo,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  const handleRangeChange = (value: string) => {
    setCurrentRange(getDateRange(value as any));
    setSearchParams({ range: value });
  }

  const rangeLabels: Record<string, string> = {
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    'this_month': 'Este mes',
    'this_year': 'Este año'
  };

  // Agrupación para PieChart del Maintenance Mix (el backend lo da por periodo, nosotros lo sumamos total para el pastel)
  const maintenanceMixPieData = useMemo(() => {
    if (!data?.dashboardData.charts.maintenanceMixByPeriod) return [];
    const totals: Record<string, number> = {};

    data.dashboardData.charts.maintenanceMixByPeriod.forEach(item => {
      const type = item.type;
      totals[type] = (totals[type] || 0) + item.count;
    });

    return Object.entries(totals).map(([key, value]) => ({
      name: TYPE_LABELS[key] || key,
      value,
      color: TYPE_COLORS[key] || '#888'
    }));
  }, [data]);

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
            {rangeLabels[currentRange.preset]} ({currentRange.dateFrom} al {currentRange.dateTo})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={currentRange.preset} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="this_month">Este mes</SelectItem>
              <SelectItem value="this_year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/admin/ordenes')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Explorar Órdenes
          </Button>
        </div>
      </div>

      {/* KPI Cards (Métricas Lean/CMMS) */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Backlog Activo</CardTitle>
            <ClipboardList className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpis.activeBacklog}</div>
            <p className="text-xs text-muted-foreground mt-1">OTs pendientes/en curso</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MTTR Promedio</CardTitle>
            <Wrench className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpis.mttrHoursAvg.toFixed(1)}{'\u00A0'}h</div>
            <p className="text-xs text-muted-foreground mt-1">Tiempo de reparación</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpis.leadTimeHoursAvg.toFixed(1)}{'\u00A0'}h</div>
            <p className="text-xs text-muted-foreground mt-1">Desde solicitud hasta cierre</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimiento Preventivo</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpis.preventiveComplianceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tareas ejecutadas a tiempo</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Rendimiento (Throughput) */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Rendimiento Semanal (Throughput)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de rendimiento semanal (throughput) de órdenes cerradas">
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

        {/* Mix de Mantenimiento */}
        <Card className="bg-card border-border shadow-sm">
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
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Técnicos */}
        <Card className="bg-card border-border shadow-sm">
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
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Top Máquinas (Tiempo Muerto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfica de barras con las máquinas con mayor tiempo muerto">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <BarChart data={rankings.topMachinesByDowntime} layout="vertical">
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
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/admin/asignar')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Asignaciones</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-transparent" onClick={() => navigate('/admin/horarios')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">Horarios</span>
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