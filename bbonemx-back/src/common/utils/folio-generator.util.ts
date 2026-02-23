import { FOLIO_PREFIX } from '../constants';

/**
 * Generador de folios para órdenes de trabajo y hallazgos.
 * 
 * Formato: {PREFIX}-{YYMMDD}-{INDEX}
 * Ejemplo: OT-2501208-001, H-2501208-001
 */
export class FolioGenerator {
  /**
   * Genera un folio para orden de trabajo.
   * @param index - Índice secuencial (se formatea a 3 dígitos)
   * @param date - Fecha para el folio (default: ahora)
   * @returns Folio en formato OT-YYMMDD-NNN
   */
  static generateWorkOrderFolio(index: number, date: Date = new Date()): string {
    return this.generate(FOLIO_PREFIX.WORK_ORDER, index, date);
  }

  /**
   * Genera un folio para hallazgo.
   * @param index - Índice secuencial (se formatea a 3 dígitos)
   * @param date - Fecha para el folio (default: ahora)
   * @returns Folio en formato H-YYMMDD-NNN
   */
  static generateFindingFolio(index: number, date: Date = new Date()): string {
    return this.generate(FOLIO_PREFIX.FINDING, index, date);
  }

  static generateMaterialRequestFolio(index: number, date: Date = new Date()): string {
    return this.generate(FOLIO_PREFIX.MATERIAL_REQUEST, index, date);
  }

  /**
   * Genera un folio con el prefijo especificado.
   * @param prefix - Prefijo del folio (OT, H, etc.)
   * @param index - Índice secuencial
   * @param date - Fecha para el folio
   * @returns Folio formateado
   */
  private static generate(prefix: string, index: number, date: Date): string {
    const dateStr = this.formatDate(date);
    const indexStr = this.formatIndex(index);
    return `${prefix}-${dateStr}-${indexStr}`;
  }

  /**
   * Formatea la fecha en formato YYMMDD.
   */
  private static formatDate(date: Date): string {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Formatea el índice a 3 dígitos.
   */
  private static formatIndex(index: number): string {
    return String(index).padStart(3, '0');
  }

  /**
   * Extrae los componentes de un folio.
   * @param folio - Folio a parsear
   * @returns Objeto con prefix, date y index
   */
  static parseFolio(folio: string): { prefix: string; date: string; index: number } | null {
    const regex = /^([A-Z]+)-(\d{6})-(\d{3})$/;
    const match = folio.match(regex);
    
    if (!match) {
      return null;
    }

    return {
      prefix: match[1],
      date: match[2],
      index: parseInt(match[3], 10),
    };
  }
}
