# Producción (VPS + Docker + GitHub Actions)

## Requisitos del VPS
- Docker y Docker Compose plugin instalados.
- Puertos abiertos: `80` (y `443` cuando se habilite TLS).
- Acceso SSH con llave para despliegue desde GitHub Actions.

## Variables de entorno

### Backend (`bbonemx-back/.env`)
- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`
- `DB_NAME=...`
- `DB_SYNCHRONIZE=false`
- `JWT_SECRET=...`
- `COOKIE_SECURE=true` (si ya hay HTTPS)
- `COOKIE_DOMAIN=.tu-dominio.com` (opcional según dominio)
- `GRAPHQL_PLAYGROUND=false`
- `GRAPHQL_INTROSPECTION=false`
- `GRAPHQL_DEBUG=false`
- `SCHEDULER_ENABLED=true`
- `ADMIN_SEED_PASSWORD=...` (si ejecutas seed en prod)

### Frontend (build args)
- `VITE_GRAPHQL_URL=https://tu-dominio.com/graphql`
- `VITE_FIREBASE_API_KEY=...`
- `VITE_FIREBASE_AUTH_DOMAIN=...`
- `VITE_FIREBASE_PROJECT_ID=...`
- `VITE_FIREBASE_STORAGE_BUCKET=...`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
- `VITE_FIREBASE_APP_ID=...`
- `VITE_FIREBASE_VAPID_KEY=...`

## Despliegue manual
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Verificación
- Health:
  - `GET /healthz`
  - `GET /readyz`
- GraphQL:
  - endpoint en `/graphql`
- Uploads:
  - endpoint en `/api/uploads`

## CI/CD
- `ci.yml`: lint + test + build (front/back).
- `docker-build-push.yml`: construye y publica imágenes a GHCR.
- `deploy.yml`: despliegue remoto por SSH al VPS.
