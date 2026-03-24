import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Providers } from '@/components/providers';
import { ProtectedRoute } from './components/protected-route';
import { AppShell } from './components/layout/app-shell';
import { USER_ROLES } from './lib/types';
// Pages
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';

// Admin
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminOrdenesPage from '@/pages/admin/orders/OrdenesPage';
import AdminOrdenDetallePage from '@/pages/admin/orders/AdminOrdenDetallePage';
import AdminCrearOTPage from '@/pages/admin/orders/CrearOTPage';
import OrdenesProgramadasPage from '@/pages/admin/orders/OrdenesProgramadasPage';
import FindingPage from './pages/admin/findings/FindingPage';
import FindingFeedbackPage from './pages/admin/findings/FindingFeedbackPage';

// Tecnico
import TecnicoAsignacionesPage from '@/pages/tecnico/AsignacionesPage';
import TecnicoPendientesPage from '@/pages/tecnico/PendientesPage';
import TecnicoOrdenPage from '@/pages/tecnico/OrdenTecnicoPage';
import MisOrdenesJefePage from '@/pages/tecnico/MisOrdenesJefePage';

// Solicitante
import SolicitanteCrearOTPage from '@/pages/solicitante/CrearOTPage';
import SolicitanteMisOrdenesPage from '@/pages/solicitante/MisOrdenesPage';

// Shared
import OrdenDetallePage from '@/pages/solicitante/OrdenDetallePage';
import PerfilPage from '@/pages/shared/PerfilPage';
import NewFindingPage from './pages/admin/findings/NewFindingPage';
import SchedulePage from './pages/admin/schedule/SchedulePage';
import TechSchedulePage from './pages/tecnico/TechSchedulePage';
import RequestersPage from './pages/admin/catalogs/RequestersPage';
import SparePartsPage from './pages/admin/catalogs/SparePartsPage';
import MaterialsPage from './pages/admin/catalogs/MaterialsPage';
import ShiftsPage from './pages/admin/catalogs/ShiftsPage';
import PositionsPage from './pages/admin/catalogs/PositionsPage';
import DepartmentsPage from './pages/admin/catalogs/DepartmentsPage';
import TechniciansPage from './pages/admin/technicians/TechniciansPage';
import TechnicianDetailPage from './pages/admin/technicians/TechnicianDetailPage';
import MachinesPage from './pages/admin/machines/MachinesPage';
import OrdersMachinePage from './pages/admin/machines/OrdersMachinePage';
import RequestsMachinePage from './pages/admin/machines/RequestsMachinePage';
import SparePartsMachinePage from './pages/admin/machines/SparePartsMachinePage';
import AreasPage from './pages/admin/areas/AreasPage';
import AreaWorkOrdersPage from './pages/admin/areas/AreaWorkOrdersPage';
import AreaMachinesPage from './pages/admin/areas/AreaMachinesPage';
import AreaFindingsPage from './pages/admin/areas/AreaFindingsPage';
import MaterialRequestsPage from './pages/material-requests/MaterialRequestsPage';
import MaterialRequestDetailPage from './pages/material-requests/MaterialRequestDetailPage';
import CreateMaterialRequestPage from './pages/material-requests/CreateMaterialRequests';
import RoleSelectorPage from './pages/RoleSelectorPage';
import OvertimePage from './pages/overtime/OvertimePage';
import MaterialRequestHistoryPage from './pages/admin/material-requests/MaterialRequestHistoryPage';

// Activities
import ActivitiesPage from './pages/admin/activities/ActivitiesPage';
import ActivityFormPage from './pages/admin/activities/ActivityFormPage';
import ActivityWorkOrdersPage from './pages/admin/activities/ActivityWorkOrdersPage';
import ActivityMaterialRequestsPage from './pages/admin/activities/ActivityMaterialRequestsPage';

const ADMIN_ONLY_ROLES = [USER_ROLES.ADMIN] as const;
const TECHNICIAN_ONLY_ROLES = [USER_ROLES.TECHNICIAN] as const;
const REQUESTER_ONLY_ROLES = [USER_ROLES.REQUESTER] as const;
const MATERIAL_REQUEST_CREATOR_ROLES = [USER_ROLES.ADMIN, USER_ROLES.BOSS] as const;

const ShellLayout = ({ title }: { title: string }) => (
  <AppShell title={title}>
    <Outlet />
  </AppShell>
)

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allowedRoles={[...ADMIN_ONLY_ROLES]} />}>

            <Route element={<ShellLayout title="Panel de Administración" />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/ordenes" element={<AdminOrdenesPage />} />
              <Route path="/admin/orden/:id" element={<AdminOrdenDetallePage />} />
              <Route path='/hallazgos' element={<FindingPage />} />
              <Route path='/hallazgos/nuevo' element={<NewFindingPage />} />
              <Route path='/hallazgos/:id/editar' element={<FindingFeedbackPage />} />
              <Route path='/solicitantes' element={<RequestersPage />} />
              <Route path='/repuestos' element={<SparePartsPage />} />
              <Route path='/materiales' element={<MaterialsPage />} />
              <Route path='/turnos' element={<ShiftsPage />} />
              <Route path='/puestos' element={<PositionsPage />} />
              <Route path='/departamentos' element={<DepartmentsPage />} />
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

          <Route element={<ProtectedRoute allowedRoles={[...TECHNICIAN_ONLY_ROLES]} />}>
            <Route element={<ShellLayout title="Portal Técnico" />}>
              <Route path="/tecnico/pendientes" element={<TecnicoPendientesPage />} />
              <Route path="/tecnico/mis-ordenes" element={<MisOrdenesJefePage />} />
              <Route path="/tecnico/crear-ot" element={<SolicitanteCrearOTPage />} />
              <Route path="/horario" element={<TechSchedulePage />} />
              <Route path="/tecnico/asignaciones" element={<TecnicoAsignacionesPage />} />
              <Route path="/tecnico/orden/:id" element={<TecnicoOrdenPage />} />
              <Route path="/tecnico/horas-extra" element={<OvertimePage />} />
            </Route>
          </Route>

          {/* SOLICITANTE */}
          <Route element={<ProtectedRoute allowedRoles={[...REQUESTER_ONLY_ROLES]} />}>
            <Route element={<ShellLayout title="Portal Solicitante" />}>
              <Route path="/solicitante/mis-ordenes" element={<SolicitanteMisOrdenesPage />} />
              <Route path="/solicitante/crear-ot" element={<SolicitanteCrearOTPage />} />
              <Route path="/solicitante/ordenes/:id" element={<OrdenDetallePage />} />
            </Route>
          </Route>

          {/* Crear solicitud de material - accesible para BOSS desde modo técnico */}
          <Route element={<ProtectedRoute allowedRoles={[...MATERIAL_REQUEST_CREATOR_ROLES]} />}>
            <Route element={<ShellLayout title="Solicitud de Material" />}>
              <Route path="/solicitud-material/nueva" element={<CreateMaterialRequestPage />} />
              <Route path="/solicitud-material/:id/editar" element={<CreateMaterialRequestPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<ShellLayout title="Mi Cuenta" />}>
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>
            <Route path="/seleccionar-rol" element={<RoleSelectorPage />} />
          </Route>

          {/* Redirecciones y 404 */}
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
