import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { dirname, join } from 'path';
import * as fs from 'fs';

import type { PdfTableDefinition, PdfTableRenderOptions } from './pdf-table-definition';
import type {
  DashboardChartPdfItem,
  DashboardChartsPdfOptions,
} from './pdf-charts-definition';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  private async createPrinter(): Promise<any> {
    const pdfmakeRoot = dirname(require.resolve('pdfmake/package.json'));
    // En `pdfmake@0.3.x` las fuentes Roboto vienen en `fonts/Roboto` (y también en `build/fonts/Roboto`).
    const fontsDir = join(pdfmakeRoot, 'fonts', 'Roboto');

    const fonts = {
      Roboto: {
        normal: join(fontsDir, 'Roboto-Regular.ttf'),
        bold: join(fontsDir, 'Roboto-Medium.ttf'),
        italics: join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: join(fontsDir, 'Roboto-MediumItalic.ttf'),
      },
    };

    // En runtime backend, usar build CommonJS (`js/Printer.js`) para evitar problemas
    // de resolución ESM/NodeNext dentro de `src/`.
    const mod: any = await import('pdfmake/js/Printer.js');
    // Con NodeNext, el import puede venir envuelto (default o incluso default.default).
    let Printer = mod?.default ?? mod;
    if (Printer?.default) {
      Printer = Printer.default;
    }
    if (typeof Printer !== 'function') {
      this.logger.error('Pdfmake Printer no es un constructor', {
        keys: mod ? Object.keys(mod) : [],
        typeofPrinter: typeof Printer,
      });
      throw new InternalServerErrorException('No se pudo inicializar el generador de PDF');
    }
    // URLResolver es requerido por pdfmake para resolver recursos (fonts/images).
    const urlResolverMod: any = await import('pdfmake/js/URLResolver.js');
    let URLResolver = urlResolverMod?.default ?? urlResolverMod;
    // NodeNext puede envolver doble (default.default)
    if (URLResolver?.default) {
      URLResolver = URLResolver.default;
    }
    if (typeof URLResolver !== 'function') {
      this.logger.error('Pdfmake URLResolver no es un constructor', {
        keys: urlResolverMod ? Object.keys(urlResolverMod) : [],
        typeofURLResolver: typeof URLResolver,
      });
      throw new InternalServerErrorException('No se pudo inicializar el resolvedor de URLs para PDF');
    }
    const urlResolver = new URLResolver(fs);

    // Constructor: new PdfPrinter(fontDescriptors, virtualfs, urlResolver)
    return new Printer(fonts, undefined, urlResolver);
  }

  private getDefaultOptions(): PdfTableRenderOptions {
    return {
      title: '',
      subtitle: '',
      headerFontSize: 12,
      bodyFontSize: 9,
      rowPadding: 3,
      rowsPerBlock: 35,
      tableHeaderFillColor: '#1F4E79',
    };
  }

  private getNestedValue(key: string, obj: any): any {
    return key.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
  }

  private toText(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
  }

  private buildRow<T>(row: T, definition: PdfTableDefinition<T>): string[] {
    return definition.columns.map((col) => {
      const raw = this.getNestedValue(col.key, row);
      if (col.transform) {
        try {
          return col.transform(raw, row);
        } catch (err) {
          this.logger.warn('Error aplicando transform para PDF', {
            key: col.key,
            err: err instanceof Error ? err.message : String(err),
          });
          return '';
        }
      }
      return this.toText(raw);
    });
  }

  private chunk<T>(items: T[], size: number): T[][] {
    if (size <= 0) return [items];
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      out.push(items.slice(i, i + size));
    }
    return out;
  }

  async streamTablePdfToWritable<T>(
    data: Iterable<T> | AsyncIterable<T>,
    definition: PdfTableDefinition<T>,
    writable: NodeJS.WritableStream,
  ): Promise<void> {
    if (!definition?.columns?.length) {
      throw new BadRequestException('columns es requerido para generar PDF');
    }
    if (!writable || typeof (writable as any).write !== 'function') {
      throw new BadRequestException('writable debe ser un stream válido');
    }

    const opts = { ...this.getDefaultOptions(), ...(definition.renderOptions ?? {}) };
    const rowsPerBlock = opts.rowsPerBlock ?? 35;
    const rowPadding = opts.rowPadding ?? 3;
    const bodyFontSize = opts.bodyFontSize ?? 9;
    const headerFontSize = opts.headerFontSize ?? 12;
    const tableHeaderFillColor = opts.tableHeaderFillColor ?? '#1F4E79';
    const topHeader = opts.topHeader;
    const startedAt = Date.now();

    try {
      // Para evitar saturar páginas, construimos el contenido en bloques de tablas
      // con `pageBreak` después de cada bloque.
      const rows: T[] = [];

      const isAsync = (input: any): input is AsyncIterable<T> =>
        input && typeof input[Symbol.asyncIterator] === 'function';
      if (isAsync(data)) {
        for await (const row of data) rows.push(row);
      } else {
        for (const row of data as Iterable<T>) rows.push(row);
      }

      const header = definition.columns.map((c) => ({
        text: c.header,
        style: 'tableHeader',
      }));
      const blocks = this.chunk(rows, rowsPerBlock);

      const widths = definition.columns.map((c) => c.width ?? '*');

      const content: any[] = [];

      if (topHeader) {
        const top = topHeader;
        const labelColor = top.labelColor ?? '000000';
        const valueColor = top.valueColor ?? 'C00000';

        const kv = (label: string, value: string) => ({
          text: [
            { text: `${label} `, bold: true, color: labelColor },
            {
              text: value,
              bold: true,
              color: valueColor,
              decoration: 'underline',
            },
          ],
        });

        // Construimos un bloque de 3 filas, imitando encabezado tipo nómina:
        // fila 1: Empresa + Fecha de elaboración
        // fila 2: AREA + Fecha de entrega a nómina
        // fila 3: PERIODO
        content.push({
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', '*'],
            body: [
              [
                kv(top.empresa.label, top.empresa.value),
                kv(top.fechaElaboracion.label, top.fechaElaboracion.value),
              ],
              [
                kv(top.area.label, top.area.value),
                kv(top.fechaEntrega.label, top.fechaEntrega.value),
              ],
              [
                {
                  colSpan: 2,
                  ...kv(top.periodo.label, top.periodo.value),
                },
                {},
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        });
      } else {
        if (opts.title) {
          content.push({ text: opts.title, fontSize: 14, bold: true, margin: [0, 0, 0, 6] });
        }
        if (opts.subtitle) {
          content.push({ text: opts.subtitle, fontSize: 10, margin: [0, 0, 0, 10] });
        }
      }

      blocks.forEach((block, idx) => {
        const body = [header, ...block.map((row) => this.buildRow(row, definition))];

        content.push({
          table: {
            headerRows: 1,
            widths,
            body,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              (rowIndex === 0 ? tableHeaderFillColor : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => rowPadding,
            paddingRight: () => rowPadding,
            paddingTop: () => rowPadding,
            paddingBottom: () => rowPadding,
          },
          fontSize: bodyFontSize,
          // Forzar salto por bloque para legibilidad.
          ...(idx < blocks.length - 1 ? { pageBreak: 'after' as const } : {}),
        });
      });

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 20, 20],
        content,
        defaultStyle: {
          font: 'Roboto',
          fontSize: bodyFontSize,
        },
        styles: {
          tableHeader: {
            bold: true,
            color: '#FFFFFF',
            fontSize: headerFontSize,
          },
        },
      };

      // Aplicar style a fila header via layout no aplica textStyle; set explícito:
      // Reescribimos headers como objetos para style.
      // (Se hace aquí para evitar duplicar transform)
      const contentFirstTable = content.find((c) => c?.table?.body) as any;
      if (contentFirstTable) {
        // no-op: estilo se controla por layout fillColor; mantendremos texto normal.
      }

      const printer = await this.createPrinter();
      const doc = await (printer as any).createPdfKitDocument(docDefinition);

      doc.on('error', (err: any) => {
        this.logger.error('Error en stream PDFKit', {
          err: err instanceof Error ? err.message : String(err),
        });
      });

      doc.pipe(writable);
      doc.end();

      await new Promise<void>((resolve, reject) => {
        writable.on('finish', resolve);
        writable.on('error', reject);
        doc.on('error', reject);
      });

      this.logger.log('PDF generado exitosamente', {
        rows: rows.length,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error generando PDF', { err: message, elapsedMs: Date.now() - startedAt });
      throw new InternalServerErrorException('Error al generar el PDF');
    }
  }

  private static readonly MAX_CHART_ITEMS = 12;
  /** Capturas 2x JPEG pueden superar ~900 KB; el límite global de body ya es amplio. */
  private static readonly MAX_IMAGE_BYTES = 2_000_000;

  private normalizeChartDataUrl(dataUrl: string): string {
    const trimmed = dataUrl?.trim() ?? '';
    const m = trimmed.match(
      /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=\s]+)$/i,
    );
    if (!m) {
      throw new BadRequestException(
        'Cada imagen debe ser data URL base64 (image/png o image/jpeg)',
      );
    }
    const mime = m[1].toLowerCase();
    const base64 = m[2].replace(/\s/g, '');
    let buf: Buffer;
    try {
      buf = Buffer.from(base64, 'base64');
    } catch {
      throw new BadRequestException('Imagen base64 inválida');
    }
    if (buf.length === 0) {
      throw new BadRequestException('Imagen vacía');
    }
    if (buf.length > PdfGeneratorService.MAX_IMAGE_BYTES) {
      throw new BadRequestException(
        `Imagen demasiado grande (máx. ${PdfGeneratorService.MAX_IMAGE_BYTES} bytes)`,
      );
    }
    return `data:${mime};base64,${base64}`;
  }

  /**
   * Valida data URLs antes de fijar headers HTTP (evita PDF corrupto en errores 400).
   */
  preflightChartsPdfItems(items: DashboardChartPdfItem[]): void {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Se requiere al menos una gráfica');
    }
    if (items.length > PdfGeneratorService.MAX_CHART_ITEMS) {
      throw new BadRequestException(
        `Máximo ${PdfGeneratorService.MAX_CHART_ITEMS} gráficas por exportación`,
      );
    }
    for (const item of items) {
      this.normalizeChartDataUrl(item.imageDataUrl);
    }
  }

  /**
   * PDF con gráficas como imágenes (capturadas en el cliente). Sin tablas.
   */
  async streamChartsPdfToWritable(
    options: DashboardChartsPdfOptions,
    writable: NodeJS.WritableStream,
  ): Promise<void> {
    if (!writable || typeof (writable as any).write !== 'function') {
      throw new BadRequestException('writable debe ser un stream válido');
    }
    const items = options?.items;
    this.preflightChartsPdfItems(items);

    /** A4 vertical: una sola página con rejilla 2 columnas (imágenes escaladas con `fit`). */
    const pageMargins: [number, number, number, number] = [22, 26, 22, 26];
    const pageInnerWidth = 595 - pageMargins[0] - pageMargins[2];
    const columnGap = 8;
    const colW = Math.floor((pageInnerWidth - columnGap) / 2);
    const fullW = Math.min(options.imageMaxWidth ?? pageInnerWidth, pageInnerWidth);
    /** Alto máximo por miniatura para intentar caber todas en una hoja. */
    const imageFitH = 168;
    const startedAt = Date.now();

    const content: any[] = [];
    const title = options.documentTitle?.trim() || 'Dashboard — Gráficas';
    content.push({
      text: title,
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 4],
    });
    if (options.subtitle?.trim()) {
      content.push({
        text: options.subtitle.trim(),
        fontSize: 8,
        color: '#444444',
        margin: [0, 0, 0, 8],
      });
    }

    for (let i = 0; i < items.length; i += 2) {
      const left = items[i];
      const right = items[i + 1];
      const titleTopMargin = i === 0 ? 0 : 5;

      if (right) {
        const safeLeft = left.title?.trim() || `Gráfica ${i + 1}`;
        const safeRight = right.title?.trim() || `Gráfica ${i + 2}`;
        const imgLeft = this.normalizeChartDataUrl(left.imageDataUrl);
        const imgRight = this.normalizeChartDataUrl(right.imageDataUrl);
        content.push({
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: safeLeft,
                  fontSize: 8,
                  bold: true,
                  margin: [0, titleTopMargin, 0, 2],
                },
                {
                  image: imgLeft,
                  fit: [colW, imageFitH],
                  alignment: 'center' as const,
                },
              ],
            },
            {
              width: '*',
              stack: [
                {
                  text: safeRight,
                  fontSize: 8,
                  bold: true,
                  margin: [0, titleTopMargin, 0, 2],
                },
                {
                  image: imgRight,
                  fit: [colW, imageFitH],
                  alignment: 'center' as const,
                },
              ],
            },
          ],
          columnGap,
        });
      } else {
        const safeTitle = left.title?.trim() || `Gráfica ${i + 1}`;
        const image = this.normalizeChartDataUrl(left.imageDataUrl);
        content.push({
          stack: [
            {
              text: safeTitle,
              fontSize: 8,
              bold: true,
              margin: [0, titleTopMargin, 0, 2],
            },
            {
              image,
              fit: [fullW, imageFitH + 14],
              alignment: 'center' as const,
            },
          ],
        });
      }
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins,
      content,
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
      },
    };

    try {
      const printer = await this.createPrinter();
      const doc = await (printer as any).createPdfKitDocument(docDefinition);
      doc.on('error', (err: any) => {
        this.logger.error('Error en stream PDFKit (charts)', {
          err: err instanceof Error ? err.message : String(err),
        });
      });
      doc.pipe(writable);
      doc.end();
      await new Promise<void>((resolve, reject) => {
        writable.on('finish', resolve);
        writable.on('error', reject);
        doc.on('error', reject);
      });
      this.logger.log('PDF de gráficas generado', {
        charts: items.length,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error generando PDF de gráficas', {
        err: message,
        elapsedMs: Date.now() - startedAt,
      });
      throw new InternalServerErrorException('Error al generar el PDF del dashboard');
    }
  }
}

