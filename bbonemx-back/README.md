# BBoneMX Back

Backend NestJS para BBoneMX Maintenance con PostgreSQL y TypeORM.

## Instalación

```bash
npm install
```

## Configuración local

1. Copia `.env.example` a `.env`.
2. Configura las credenciales de PostgreSQL.
3. Mantén `DB_SYNCHRONIZE=true` **solo** si estás desarrollando localmente y necesitas iterar rápido.
4. Para cualquier entorno compartido, staging o producción, usa `DB_SYNCHRONIZE=false` y aplica migraciones versionadas.

## Comandos principales

```bash
# desarrollo
npm run start:dev

# build
npm run build

# tests
npm run test
```

## Flujo de migraciones TypeORM

La fuente de verdad del esquema es `src/infrastructure/database/migrations/`.

```bash
# crear una migración vacía
npm run migration:create --name=NombreMigracion

# generar una migración a partir de cambios en entidades
npm run migration:generate --name=NombreMigracion

# ejecutar migraciones pendientes
npm run migration:run

# revertir la última migración aplicada
npm run migration:revert

# listar el estado de migraciones
npm run migration:show
```

## Flujo de despliegue basado en migraciones

1. Actualiza entidades y crea una migración versionada.
2. Revisa el SQL generado antes de hacer commit.
3. Ejecuta `npm run build` para validar compilación.
4. En despliegue, configura `DB_SYNCHRONIZE=false`.
5. Publica el artefacto y ejecuta `npm run migration:run` antes de levantar la app.
6. Si necesitas datos iniciales, corre `npm run seed` **después** de las migraciones.

## Recomendaciones

- No uses `synchronize` en staging o producción.
- Haz commit de cada migración junto con los cambios de entidades relacionados.
- Si una migración falla en despliegue, corrige el problema y vuelve a ejecutar el pipeline; usa `migration:revert` solo cuando el plan de rollback esté claro.
