/**
 * BB Maintenance - Pages barrel export
 * Import all pages from this file for cleaner imports.
 */

// Public
export { default as LoginPage } from './LoginPage';
export { default as HomePage } from './HomePage';

// Admin
export { default as AdminDashboardPage } from './admin/DashboardPage';
export { default as AdminOrdenesPage } from './admin/orders/OrdenesPage';
export { default as AdminOrdenDetallePage } from './admin/orders/AdminOrdenDetallePage';
export { default as AdminCrearOTPage } from './admin/orders/CrearOTPage';
export { default as AdminOrdenesProgramadasPage } from './admin/orders/OrdenesProgramadasPage';
// Removed stale exports: these files do not exist

// Tecnico
export { default as TecnicoAsignacionesPage } from './tecnico/AsignacionesPage';
export { default as TecnicoPendientesPage } from './tecnico/PendientesPage';
export { default as TecnicoOrdenPage } from './tecnico/OrdenTecnicoPage';

// Solicitante
export { default as SolicitanteCrearOTPage } from './solicitante/CrearOTPage';
export { default as SolicitanteMisOrdenesPage } from './solicitante/MisOrdenesPage';

// Shared
export { default as OrdenDetallePage } from './solicitante/OrdenDetallePage';
export { default as PerfilPage } from './shared/PerfilPage';
