export type PdfTableAlign = 'left' | 'center' | 'right';

export interface PdfTableColumnDefinition<T = any> {
  header: string;
  key: string;
  width?: number | 'auto' | '*' | string;
  align?: PdfTableAlign;
  transform?: (value: any, row: T) => string;
}

export interface PdfTableRenderOptions {
  title?: string;
  subtitle?: string;
  headerFontSize?: number;
  bodyFontSize?: number;
  rowPadding?: number;

  /**
   * Para mantener legibilidad: forzar que la tabla se divida en bloques.
   * Cada bloque incluye header y termina con `pageBreak`.
   */
  rowsPerBlock?: number;
}

export interface PdfTableDefinition<T = any> {
  columns: PdfTableColumnDefinition<T>[];
  renderOptions?: PdfTableRenderOptions;
}

