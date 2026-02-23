# Seeds

Esta carpeta contiene los seeders para datos iniciales del sistema.

## Uso

Los seeds se ejecutan manualmente usando el siguiente comando:

```bash
# Ejecutar todos los seeds
npm run seed
```

## Seeds disponibles

| Archivo | Descripción |
|---------|-------------|
| `roles.seed.ts` | Crea los roles iniciales: ADMIN, TECHNICIAN, REQUESTER |
| `admin.seed.ts` | Crea el usuario administrador inicial |

## Orden de ejecución

Los seeds se ejecutan en el siguiente orden (el orden importa por dependencias):

1. **Roles** - Se crean primero ya que el usuario admin requiere un rol
2. **Admin** - Se crea el usuario administrador con el rol ADMIN

## Idempotencia

Los seeds son **idempotentes**: pueden ejecutarse múltiples veces sin crear duplicados. Cada seed verifica si los datos ya existen antes de crearlos.

## Usuario administrador inicial

Después de ejecutar los seeds, tendrás acceso con:

| Campo | Valor |
|-------|-------|
| Número de empleado | `ADMIN001` |
| Email | `admin@bbonemx.com` |
| Contraseña | `Admin123!` |

> ⚠️ **IMPORTANTE**: Cambia la contraseña del administrador en producción.

## Agregar nuevos seeds

1. Crea un nuevo archivo `nombre.seed.ts` siguiendo el patrón de los existentes
2. Exporta una función `seedNombre(dataSource: DataSource): Promise<void>`
3. Importa y ejecuta el seed en `index.ts` respetando el orden de dependencias
