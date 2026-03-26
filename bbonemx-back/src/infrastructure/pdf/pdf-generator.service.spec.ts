import { PassThrough } from 'stream';
import { PdfGeneratorService } from './pdf-generator.service';
import type { PdfTableDefinition } from './pdf-table-definition';

describe('PdfGeneratorService', () => {
  it('genera un PDF no vacío (firma %PDF)', async () => {
    const service = new PdfGeneratorService();

    // Stub del printer para que el test no dependa de internals/ESM de pdfmake.
    // Verificamos el contrato: el servicio escribe bytes de un PDF al writable.
    (
      service as unknown as { createPrinter: () => Promise<unknown> }
    ).createPrinter = async () => {
      await Promise.resolve();
      return {
        createPdfKitDocument: () => {
          const doc = new PassThrough();
          // El servicio llama `doc.pipe(writable)` y luego `doc.end()` inmediatamente.
          // Para garantizar que el destino reciba bytes, escribimos justo en `end()`.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const originalEnd = (
            doc as unknown as { end: (...args: unknown[]) => unknown }
          ).end.bind(doc);
          doc.end = ((...args: unknown[]) => {
            doc.write(Buffer.from('%PDF-1.4\n'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return originalEnd(...args);
          }) as unknown as typeof doc.end;
          return doc;
        },
      };
    };

    type Row = { a: string; b: number };
    const report: PdfTableDefinition<Row> = {
      columns: [
        { header: 'A', key: 'a' },
        { header: 'B', key: 'b', transform: (v) => String(v) },
      ],
      renderOptions: {
        title: 'Test',
        rowsPerBlock: 5,
      },
    };

    const pass = new PassThrough();
    const chunks: Buffer[] = [];
    pass.on('data', (c: Buffer) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)),
    );

    await service.streamTablePdfToWritable(
      [
        { a: 'x', b: 1 },
        { a: 'y', b: 2 },
      ],
      report,
      pass,
    );

    const bytes = Buffer.concat(chunks);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.subarray(0, 4).toString('utf8')).toBe('%PDF');
  });

  it('streamChartsPdfToWritable genera PDF con imágenes', async () => {
    const service = new PdfGeneratorService();
    (
      service as unknown as { createPrinter: () => Promise<unknown> }
    ).createPrinter = async () => {
      await Promise.resolve();
      return {
        createPdfKitDocument: () => {
          const doc = new PassThrough();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const originalEnd = (
            doc as unknown as { end: (...args: unknown[]) => unknown }
          ).end.bind(doc);
          doc.end = ((...args: unknown[]) => {
            doc.write(Buffer.from('%PDF-1.4\n'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return originalEnd(...args);
          }) as unknown as typeof doc.end;
          return doc;
        },
      };
    };

    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const pass = new PassThrough();
    const chunks: Buffer[] = [];
    pass.on('data', (c: Buffer) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)),
    );

    await service.streamChartsPdfToWritable(
      {
        documentTitle: 'Test dashboard',
        items: [{ title: 'Gráfica 1', imageDataUrl: tinyPng }],
      },
      pass,
    );

    const bytes = Buffer.concat(chunks);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.subarray(0, 4).toString('utf8')).toBe('%PDF');
  });
});
