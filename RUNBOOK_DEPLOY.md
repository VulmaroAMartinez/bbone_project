# Runbook de Deploy (VPS)

## 1. Preparación
- Confirmar que el VPS tiene Docker + Compose.
- Confirmar que existe `bbonemx-back/.env` en el VPS con secretos reales.
- Confirmar DNS apuntando al VPS.

## 2. Despliegue
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

## 3. Verificación post-deploy
- Backend health:
```bash
curl -f http://localhost/healthz
curl -f http://localhost/readyz
```
- GraphQL:
```bash
curl -I http://localhost/graphql
```

## 4. Migraciones / Seeds
- Si tienes script de migraciones:
```bash
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```
- Seeds (solo cuando aplique):
```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

## 5. Rollback rápido
- Revertir a commit/tag anterior y redeploy:
```bash
git checkout <tag-o-commit-anterior>
docker compose -f docker-compose.prod.yml up -d --build
```
