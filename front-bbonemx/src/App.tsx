/**
 * BB Maintenance - App Router Principal
 * Configuracion de rutas con React Router para toda la aplicacion CMMS.
 * Cada ruta esta protegida por rol usando ProtectedRoute.
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import { Providers } from '@/components/providers';
import { ProtectedRoute } from './components/protected-route';
import { AppShell } from './components/layout/app-shell';
import { UserRole } from './lib/types';
// Pages
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';

// Admin
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminOrdenesPage from '@/pages/admin/OrdenesPage';
import AdminOrdenDetallePage from '@/pages/admin/AdminOrdenDetallePage';
import AdminCrearOTPage from '@/pages/admin/CrearOTPage';
import AdminHorariosPage from '@/pages/admin/HorariosPage';
import AdminTecnicosPage from '@/pages/admin/TecnicosPage';

// Tecnico
import TecnicoAsignacionesPage from '@/pages/tecnico/AsignacionesPage';
import TecnicoPendientesPage from '@/pages/tecnico/PendientesPage';
import TecnicoHorarioPage from '@/pages/tecnico/HorarioPage';
import TecnicoOrdenPage from '@/pages/tecnico/OrdenTecnicoPage';

// Solicitante
import SolicitanteCrearOTPage from '@/pages/solicitante/CrearOTPage';
import SolicitanteMisOrdenesPage from '@/pages/solicitante/MisOrdenesPage';

// Shared
import OrdenDetallePage from '@/pages/solicitante/OrdenDetallePage';
import PerfilPage from '@/pages/shared/PerfilPage';

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

          {/* Rutas Protegidas y con Shell */}
          
          
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
             
             <Route element={<ShellLayout title="Panel de Administración" />}>
               <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
               <Route path="/admin/ordenes" element={<AdminOrdenesPage />} />
               <Route path="/admin/ordenes/:id" element={<AdminOrdenDetallePage />} />
                <Route path="/admin/crear-ot" element={<AdminCrearOTPage />} />
               {/* <Route path="/admin/horarios" element={<AdminHorariosPage />} /> */}
               {/* <Route path="/admin/tecnicos" element={<AdminTecnicosPage />} /> */}
             </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]} />}>
             <Route element={<ShellLayout title="Portal Técnico" />}>
                <Route path="/tecnico/pendientes" element={<TecnicoPendientesPage />} />
                {/* <Route path="/tecnico/horario" element={<TecnicoHorarioPage />} /> */}
                <Route path="/tecnico/asignaciones" element={<TecnicoAsignacionesPage />} />
                <Route path="/tecnico/orden/:id" element={<TecnicoOrdenPage />} />
             </Route>
          </Route>

          {/* SOLICITANTE */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.REQUESTER]} />}>
             <Route element={<ShellLayout title="Portal Solicitante" />}>
                <Route path="/solicitante/mis-ordenes" element={<SolicitanteMisOrdenesPage />} />
                <Route path="/solicitante/crear-ot" element={<SolicitanteCrearOTPage />} />
                <Route path="/solicitante/ordenes/:id" element={<OrdenDetallePage />} />
             </Route>
          </Route>
          
           <Route element={<ProtectedRoute />}>
             <Route element={<ShellLayout title="Mi Cuenta" />}>
                <Route path="/perfil" element={<PerfilPage />} />
             </Route>
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
