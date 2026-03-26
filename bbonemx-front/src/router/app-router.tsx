import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { UserRole } from '@/lib/types';
import { ProtectedRoute } from '@/router/protected-route';

import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminOrdenesPage from '@/pages/admin/orders/OrdenesPage';
import AdminOrdenDetallePage from '@/pages/admin/orders/AdminOrdenDetallePage';
import AdminCrearOTPage from '@/pages/admin/orders/CrearOTPage';
import OrdenesProgramadasPage from '@/pages/admin/orders/OrdenesProgramadasPage';
import FindingPage from '@/pages/admin/findings/FindingPage';
import NewFindingPage from '@/pages/admin/findings/NewFindingPage';
import FindingFeedbackPage from '@/pages/admin/findings/FindingFeedbackPage';
import SchedulePage from '@/pages/admin/schedule/SchedulePage';
import TechniciansPage from '@/pages/admin/technicians/TechniciansPage';
import TechnicianDetailPage from '@/pages/admin/technicians/TechnicianDetailPage';
import MachinesPage from '@/pages/admin/machines/MachinesPage';
import OrdersMachinePage from '@/pages/admin/machines/OrdersMachinePage';
import RequestsMachinePage from '@/pages/admin/machines/RequestsMachinePage';
import SparePartsMachinePage from '@/pages/admin/machines/SparePartsMachinePage';
import RequestersPage from '@/pages/admin/catalogs/RequestersPage';
import SparePartsPage from '@/pages/admin/catalogs/SparePartsPage';
import MaterialsPage from '@/pages/admin/catalogs/MaterialsPage';
import ShiftsPage from '@/pages/admin/catalogs/ShiftsPage';
import PositionsPage from '@/pages/admin/catalogs/PositionsPage';
import DepartmentsPage from '@/pages/admin/catalogs/DepartmentsPage';
import AreasPage from '@/pages/admin/areas/AreasPage';
import AreaWorkOrdersPage from '@/pages/admin/areas/AreaWorkOrdersPage';
import AreaMachinesPage from '@/pages/admin/areas/AreaMachinesPage';
import AreaFindingsPage from '@/pages/admin/areas/AreaFindingsPage';
import MaterialRequestHistoryPage from '@/pages/admin/material-requests/MaterialRequestHistoryPage';
import ActivitiesPage from '@/pages/admin/activities/ActivitiesPage';
import ActivityFormPage from '@/pages/admin/activities/ActivityFormPage';
import ActivityWorkOrdersPage from '@/pages/admin/activities/ActivityWorkOrdersPage';
import ActivityMaterialRequestsPage from '@/pages/admin/activities/ActivityMaterialRequestsPage';
import TecnicoPendientesPage from '@/pages/tecnico/PendientesPage';
import MisOrdenesJefePage from '@/pages/tecnico/MisOrdenesJefePage';
import SolicitanteCrearOTPage from '@/pages/solicitante/CrearOTPage';
import TechSchedulePage from '@/pages/tecnico/TechSchedulePage';
import TecnicoAsignacionesPage from '@/pages/tecnico/AsignacionesPage';
import TecnicoOrdenPage from '@/pages/tecnico/OrdenTecnicoPage';
import SolicitanteMisOrdenesPage from '@/pages/solicitante/MisOrdenesPage';
import OrdenDetallePage from '@/pages/solicitante/OrdenDetallePage';
import MaterialRequestsPage from '@/pages/material-requests/MaterialRequestsPage';
import MaterialRequestDetailPage from '@/pages/material-requests/MaterialRequestDetailPage';
import CreateMaterialRequestPage from '@/pages/material-requests/CreateMaterialRequests';
import OvertimePage from '@/pages/overtime/OvertimePage';
import PerfilPage from '@/pages/shared/PerfilPage';
import RoleSelectorPage from '@/pages/RoleSelectorPage';

const ShellLayout = ({ title }: { title: string }) => (
  <AppShell title={title}>
    <Outlet />
  </AppShell>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route element={<ShellLayout title="Panel de administración" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/ordenes" element={<AdminOrdenesPage />} />
            <Route path="/admin/orden/:id" element={<AdminOrdenDetallePage />} />
            <Route path="/hallazgos" element={<FindingPage />} />
            <Route path="/hallazgos/nuevo" element={<NewFindingPage />} />
            <Route path="/hallazgos/:id/editar" element={<FindingFeedbackPage />} />
            <Route path="/solicitantes" element={<RequestersPage />} />
            <Route path="/repuestos" element={<SparePartsPage />} />
            <Route path="/materiales" element={<MaterialsPage />} />
            <Route path="/turnos" element={<ShiftsPage />} />
            <Route path="/puestos" element={<PositionsPage />} />
            <Route path="/departamentos" element={<DepartmentsPage />} />
            <Route path="/admin/crear-ot" element={<AdminCrearOTPage />} />
            <Route path="/admin/ordenes-programadas" element={<OrdenesProgramadasPage />} />
            <Route path="/horarios" element={<SchedulePage />} />
            <Route path="/tecnicos" element={<TechniciansPage />} />
            <Route path="/tecnico/:id" element={<TechnicianDetailPage />} />
            <Route path="/maquinas" element={<MachinesPage />} />
            <Route path="/maquinas/:id/ordenes" element={<OrdersMachinePage />} />
            <Route path="/maquinas/:id/solicitudes" element={<RequestsMachinePage />} />
            <Route path="/maquinas/:id/refacciones" element={<SparePartsMachinePage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/areas/:id/ordenes" element={<AreaWorkOrdersPage />} />
            <Route path="/areas/:id/maquinas" element={<AreaMachinesPage />} />
            <Route path="/areas/:id/hallazgos" element={<AreaFindingsPage />} />
            <Route path="/solicitud-material" element={<MaterialRequestsPage />} />
            <Route path="/seguimiento-solicitudes" element={<MaterialRequestHistoryPage />} />
            <Route path="/solicitud-material/:id" element={<MaterialRequestDetailPage />} />
            <Route path="/horas-extra" element={<OvertimePage />} />
            <Route path="/admin/actividades" element={<ActivitiesPage />} />
            <Route path="/admin/actividades/nueva" element={<ActivityFormPage />} />
            <Route path="/admin/actividades/:id/editar" element={<ActivityFormPage />} />
            <Route path="/admin/actividades/:id/ordenes" element={<ActivityWorkOrdersPage />} />
            <Route path="/admin/actividades/:id/solicitudes" element={<ActivityMaterialRequestsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]} />}>
          <Route element={<ShellLayout title="Portal técnico" />}>
            <Route path="/tecnico/pendientes" element={<TecnicoPendientesPage />} />
            <Route path="/tecnico/mis-ordenes" element={<MisOrdenesJefePage />} />
            <Route path="/tecnico/crear-ot" element={<SolicitanteCrearOTPage />} />
            <Route path="/horario" element={<TechSchedulePage />} />
            <Route path="/tecnico/asignaciones" element={<TecnicoAsignacionesPage />} />
            <Route path="/tecnico/orden/:id" element={<TecnicoOrdenPage />} />
            <Route path="/tecnico/horas-extra" element={<OvertimePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[UserRole.REQUESTER]} />}>
          <Route element={<ShellLayout title="Portal solicitante" />}>
            <Route path="/solicitante/mis-ordenes" element={<SolicitanteMisOrdenesPage />} />
            <Route path="/solicitante/crear-ot" element={<SolicitanteCrearOTPage />} />
            <Route path="/solicitante/ordenes/:id" element={<OrdenDetallePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BOSS]} />}>
          <Route element={<ShellLayout title="Solicitud de material" />}>
            <Route path="/solicitud-material/nueva" element={<CreateMaterialRequestPage />} />
            <Route path="/solicitud-material/:id/editar" element={<CreateMaterialRequestPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ShellLayout title="Mi cuenta" />}>
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>
          <Route path="/seleccionar-rol" element={<RoleSelectorPage />} />
        </Route>

        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
