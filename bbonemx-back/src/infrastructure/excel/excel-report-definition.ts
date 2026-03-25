import { ExcelColumnDefinition } from './excel-column.interface';

export interface ExcelRenderOptions {
  /**
   * Color ARGB (ej: `1F4E79`) para el encabezado.
   * Si no se especifica, se usa el valor por defecto del sistema.
   */
  headerColor?: string;

  enableBorders?: boolean;
  enableAutoFilter?: boolean;
  enableAutoFit?: boolean;

  /**
   * Límite máximo para el ancho de columnas cuando `enableAutoFit` está activo.
   */
  maxColumnWidth?: number;
}

export interface ExcelReportDefinition<T = any> {
  sheetName: string;
  columns: ExcelColumnDefinition<T>[];
  renderOptions?: ExcelRenderOptions;
}

