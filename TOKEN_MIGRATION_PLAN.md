# Token Migration Plan: localStorage → HttpOnly Cookies

## Objetivo
Migrar el almacenamiento de `auth_token` desde `localStorage` a cookies `HttpOnly` seguras sin romper el flujo actual de login/logout en frontend y backend.

## Fase 1 (Backward compatible)
1. **Backend**
   - Exponer `Set-Cookie` en `login` con `HttpOnly`, `Secure`, `SameSite=Lax` y expiración alineada con JWT.
   - Mantener temporalmente retorno de `accessToken` para compatibilidad.
2. **Frontend**
   - Mantener lectura de `auth_token` en `localStorage` como fallback.
   - Priorizar sesión basada en cookie (Apollo con `credentials: 'include'`).

## Fase 2 (Dual-read + observabilidad)
1. Registrar métricas de autenticación por mecanismo (cookie vs header bearer).
2. Alertar si hay clientes que aún dependen de `localStorage`.
3. Endurecer CSP y sanitización para reducir exposición a XSS durante transición.

## Fase 3 (Cutover)
1. Eliminar escritura de `auth_token` en `localStorage` en frontend.
2. Eliminar soporte de bearer token emitido para navegador (mantener para integraciones no-web si aplica).
3. Forzar CSRF protection:
   - Double-submit token o CSRF token en header para mutaciones.

## Fase 4 (Post-cutover hardening)
1. Rotación de refresh token con invalidación de sesión previa.
2. Auditoría de sesiones activas y revocación por dispositivo.
3. Pruebas E2E de login, refresh, logout, expiración y multi-pestaña.

## Criterios de éxito
- Ningún flujo de login/logout roto en producción.
- 0 almacenamiento de token de acceso en `localStorage` para clientes web.
- Tasa de errores de autenticación sin regresión tras la migración.
