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

export interface ExcelPreRowsRenderOptions {
  /**
   * Column indices 1-based donde va el texto "label" (ej: "Empresa:", "AREA:", "PERIODO:").
   */
  labelColumns?: number[];
  /**
   * Column indices 1-based donde va el texto "value" (ej: nombre de empresa, período, fechas).
   */
  valueColumns?: number[];

  labelFontColor?: string; // ARGB (ej: '000000')
  valueFontColor?: string; // ARGB (ej: 'C00000')

  labelBold?: boolean;
  valueBold?: boolean;

  underlineValue?: boolean;
}

export interface ExcelReportDefinition<T = any> {
  sheetName: string;
  columns: ExcelColumnDefinition<T>[];
  renderOptions?: ExcelRenderOptions;
  /**
   * Filas informativas previas a la tabla (ej: encabezado institucional/período).
   * Cada entrada representa una fila completa.
   */
  preRows?: Array<Array<string | number>>;

  /**
   * Estilo para las filas previas (preRows) para reportes tipo nómina.
   * Si no se define, no se aplica estilo específico.
   */
  preRowsRenderOptions?: ExcelPreRowsRenderOptions;
}

