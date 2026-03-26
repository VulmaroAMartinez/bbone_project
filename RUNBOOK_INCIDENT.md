# Runbook de Incidentes

## 1. Aplicación caída
- Ver estado:
```bash
docker compose -f docker-compose.prod.yml ps
```
- Ver logs:
```bash
docker compose -f docker-compose.prod.yml logs --tail=200 backend
docker compose -f docker-compose.prod.yml logs --tail=200 nginx
```

## 2. Error de DB
- Confirmar contenedor postgres:
```bash
docker compose -f docker-compose.prod.yml ps postgres
```
- Revisar conectividad desde backend:
```bash
docker compose -f docker-compose.prod.yml exec backend node -e "console.log('backend up')"
```

## 3. Fallas de GraphQL / Auth
- Revisar logs de backend por errores `UNAUTHENTICATED`, `CSRF token inválido`.
- Verificar env en backend:
  - `JWT_SECRET`
  - `COOKIE_SECURE`
  - `COOKIE_DOMAIN`
  - `CORS_ORIGIN`

## 4. Uploads no disponibles
- Confirmar volumen:
```bash
docker volume ls
```
- Confirmar endpoint:
```bash
curl -I http://localhost/api/uploads/<archivo>
```

## 5. Acciones de mitigación
- Reinicio controlado:
```bash
docker compose -f docker-compose.prod.yml restart backend nginx
```
- Si persiste, rollback a versión anterior (ver `RUNBOOK_DEPLOY.md`).
