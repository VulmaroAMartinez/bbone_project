import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { dirname, join } from 'path';

import type { PdfTableDefinition, PdfTableRenderOptions } from './pdf-table-definition';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  private async createPrinter(): Promise<any> {
    // Usar fonts incluidas en `pdfmake` (node_modules) para evitar assets externos.
    // Nota: esto no guarda archivos; solo referencia recursos del paquete instalado.
    const pdfmakeRoot = dirname(require.resolve('pdfmake/package.json'));
    const fontsDir = join(pdfmakeRoot, 'examples', 'fonts');

    const fonts = {
      Roboto: {
        normal: join(fontsDir, 'Roboto-Regular.ttf'),
        bold: join(fontsDir, 'Roboto-Medium.ttf'),
        italics: join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: join(fontsDir, 'Roboto-MediumItalic.ttf'),
      },
    };

    // En NodeNext, `pdfmake/src/printer` se carga mejor con `import()` (ESM).
    const mod: any = await import('pdfmake/src/printer.js');
    const Printer = mod?.default ?? mod;
    return new Printer(fonts);
  }

  private getDefaultOptions(): Required<PdfTableRenderOptions> {
    return {
      title: '',
      subtitle: '',
      headerFontSize: 10,
      bodyFontSize: 9,
      rowPadding: 3,
      rowsPerBlock: 35,
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

      const header = definition.columns.map((c) => c.header);
      const blocks = this.chunk(rows, opts.rowsPerBlock);

      const widths = definition.columns.map((c) => c.width ?? '*');
      const bodyFontSize = opts.bodyFontSize;
      const headerFontSize = opts.headerFontSize;

      const content: any[] = [];
      if (opts.title) {
        content.push({ text: opts.title, fontSize: 14, bold: true, margin: [0, 0, 0, 6] });
      }
      if (opts.subtitle) {
        content.push({ text: opts.subtitle, fontSize: 10, margin: [0, 0, 0, 10] });
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
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#1F4E79' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => opts.rowPadding,
            paddingRight: () => opts.rowPadding,
            paddingTop: () => opts.rowPadding,
            paddingBottom: () => opts.rowPadding,
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
      const doc = (printer as any).createPdfKitDocument(docDefinition);

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
}

