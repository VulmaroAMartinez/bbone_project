import { PassThrough } from 'stream';
import { PdfGeneratorService } from './pdf-generator.service';
import type { PdfTableDefinition } from './pdf-table-definition';

describe('PdfGeneratorService', () => {
  it('genera un PDF no vacío (firma %PDF)', async () => {
    const service = new PdfGeneratorService();

    // Stub del printer para que el test no dependa de internals/ESM de pdfmake.
    // Verificamos el contrato: el servicio escribe bytes de un PDF al writable.
    (service as any).createPrinter = async () => ({
      createPdfKitDocument: () => {
        const doc = new PassThrough();
        // El servicio llama `doc.pipe(writable)` y luego `doc.end()` inmediatamente.
        // Para garantizar que el destino reciba bytes, escribimos justo en `end()`.
        const originalEnd = doc.end.bind(doc);
        doc.end = ((...args: any[]) => {
          doc.write(Buffer.from('%PDF-1.4\n'));
          return originalEnd(...args);
        }) as any;
        return doc;
      },
    });

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
    pass.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

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
});

