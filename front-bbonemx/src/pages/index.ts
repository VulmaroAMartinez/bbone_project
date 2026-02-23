/**
 * BB Maintenance - Pages barrel export
 * Import all pages from this file for cleaner imports.
 */

// Public
export { default as LoginPage } from './LoginPage';
export { default as HomePage } from './HomePage';

// Admin
export { default as AdminDashboardPage } from './admin/DashboardPage';
export { default as AdminOrdenesPage } from './admin/OrdenesPage';
export { default as AdminOrdenDetallePage } from './admin/AdminOrdenDetallePage';
export { default as AdminCrearOTPage } from './admin/CrearOTPage';
export { default as AdminAsignarPage } from './admin/AsignarPage';
export { default as AdminHorariosPage } from './admin/HorariosPage';
export { default as AdminTecnicosPage } from './admin/TecnicosPage';

// Tecnico
export { default as TecnicoAsignacionesPage } from './tecnico/AsignacionesPage';
export { default as TecnicoPendientesPage } from './tecnico/PendientesPage';
export { default as TecnicoHorarioPage } from './tecnico/HorarioPage';
export { default as TecnicoOrdenPage } from './tecnico/OrdenTecnicoPage';

// Solicitante
export { default as SolicitanteCrearOTPage } from './solicitante/CrearOTPage';
export { default as SolicitanteMisOrdenesPage } from './solicitante/MisOrdenesPage';

// Shared
export { default as OrdenDetallePage } from './solicitante/OrdenDetallePage';
export { default as PerfilPage } from './shared/PerfilPage';
