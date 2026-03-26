export type PdfTableAlign = 'left' | 'center' | 'right';

export interface PdfTableColumnDefinition<T = unknown> {
  header: string;
  key: string;
  width?: number | string;
  align?: PdfTableAlign;
  transform?: (value: unknown, row: T) => string;
}

export interface PdfTableRenderOptions {
  title?: string;
  subtitle?: string;
  headerFontSize?: number;
  bodyFontSize?: number;
  rowPadding?: number;
  /**
   * Color de fondo del header de la tabla (hex, ej: '#C00000').
   */
  tableHeaderFillColor?: string;

  /**
   * Cabecera superior (tipo nómina) antes de la tabla principal.
   */
  topHeader?: PdfTopHeaderDefinition;

  /**
   * Para mantener legibilidad: forzar que la tabla se divida en bloques.
   * Cada bloque incluye header y termina con `pageBreak`.
   */
  rowsPerBlock?: number;
}

export interface PdfTopHeaderKeyValue {
  label: string;
  value: string;
}

export interface PdfTopHeaderDefinition {
  empresa: PdfTopHeaderKeyValue;
  area: PdfTopHeaderKeyValue;
  fechaElaboracion: PdfTopHeaderKeyValue;
  fechaEntrega: PdfTopHeaderKeyValue;
  periodo: PdfTopHeaderKeyValue;

  valueColor?: string;
  labelColor?: string;
}

export interface PdfTableDefinition<T = unknown> {
  columns: PdfTableColumnDefinition<T>[];
  renderOptions?: PdfTableRenderOptions;
}
