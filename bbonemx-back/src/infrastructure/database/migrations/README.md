# Migrations

Esta carpeta contiene las migraciones de TypeORM.

## Comandos útiles

```bash
# Generar migración basada en cambios en entidades
npm run migration:generate -- -n NombreMigracion

# Crear migración vacía
npm run migration:create -- -n NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Mostrar migraciones ejecutadas
npm run migration:show
```
