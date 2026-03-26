# ADR: Exportación Excel con ExcelJS (sin almacenamiento en servidor)

## Contexto
Actualmente el módulo `activities` exporta un reporte a Excel usando `exceljs`:

1. `ActivitiesResolver.exportActivitiesExcel` (GraphQL) recibe `filters`/`sort`.
2. `ActivitiesService.exportToExcel` obtiene datos del repository.
3. `ExcelGeneratorService.generateExcelBase64` genera el Excel en memoria (`writeBuffer`) y lo convierte a `base64`.
4. El front decodifica el `base64` y descarga el archivo vía `Blob`.

La generación ocurre en un servicio reutilizable (`ExcelGeneratorService`) y existe un `ExcelModule`.

## Problemas detectados

### Rendimiento y memoria
- Se usa siempre `workbook.xlsx.writeBuffer()` y posteriormente `buffer.toString('base64')`, duplicando el consumo de memoria (buffer + base64).
- Para datasets grandes:
  - El estilo de bordes recorre celdas fila por fila.
  - El “auto-fit” de ancho también recorre valores para calcular longitudes.

### Consistencia y mantenibilidad
- `ExcelGeneratorService` mezcla la mecánica de exportación (buffer vs stream) con detalles de “render” (bordes, auto-fit, auto-filter).
- No existe un contrato explícito para:
  - el “reporte” (sheetName + columnas + opciones de estilo/feature flags),
  - y la estrategia de escritura (buffer vs streaming).

### Extensibilidad
- Para agregar nuevos reportes en otros módulos hay que replicar lógica y opciones manualmente.
- La definición actual por columnas (`ExcelColumnDefinition`) es un buen punto de partida, pero falta el “envoltorio” (`ExcelReportDefinition`) que estandarice opciones de generación.

## Decisiones

### Contrato de reporte
- Introducir `ExcelReportDefinition`:
  - `sheetName`
  - `columns` (usando `ExcelColumnDefinition`)
  - `renderOptions` (borders, auto-filter, auto-fit, etc.)

### Estrategias de salida
- Exponer dos modos en la capa de infraestructura:
  - `generateExcelBuffer(...)`: para reportes pequeños (simple y compatible con GraphQL/base64).
  - `streamExcelToWritable(...)`: para reportes grandes, escribiendo directamente al `Response` (sin archivos temporales en disco ni almacenamiento persistente).

### Política de selección buffer vs stream
- Agregar una decisión por “tamaño” (p.ej. usando un `countForExcelExport`).
- Para streaming:
  - Deshabilitar features costosas no imprescindibles (ej. auto-fit) a menos que se soporten de forma eficiente en modo stream.
  - Aun así, mantener el estilo consistente cuando sea posible.

## Consecuencias

### Positivas
- Se reduce el consumo de memoria al evitar `base64` y escrituras redundantes.
- El núcleo Excel queda reutilizable y desacoplado del dataset del módulo.
- Agregar nuevos reportes se vuelve un ejercicio de “definir columnas y opciones”, en lugar de copiar/pegar estilos y lógica.

### Trade-offs
- Algunas features (auto-fit) pueden diferir entre buffer y stream por restricciones de `exceljs` streaming.
- Se requiere estandarizar el contrato y actualizar el `activities` para usar la nueva definición.

## Reglas de cumplimiento
- Nunca almacenar archivos en disco ni en almacenamiento temporal persistente.
- Para streaming, escribir directamente al stream HTTP.
- Validar datos mínimos antes de generar: definiciones de columnas y transforms seguras.

