# Migrations

Esta carpeta contiene las migraciones versionadas de TypeORM.

## Comandos útiles

```bash
# Generar migración basada en cambios en entidades
npm run migration:generate --name=NombreMigracion

# Crear migración vacía
npm run migration:create --name=NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Mostrar migraciones ejecutadas / pendientes
npm run migration:show
```

## Nota

`synchronize` solo debe usarse en desarrollo local. En entornos compartidos, staging y producción el esquema debe evolucionar exclusivamente mediante migraciones versionadas.
