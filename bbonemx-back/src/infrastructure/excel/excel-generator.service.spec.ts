import * as ExcelJS from 'exceljs';
import { ExcelGeneratorService } from './excel-generator.service';
import type { ExcelReportDefinition } from './excel-report-definition';
import { PassThrough } from 'stream';

describe('ExcelGeneratorService', () => {
  type TestRow = {
    area?: { name?: string };
    status?: boolean;
  };

  it('mapea claves anidadas y aplica transform', async () => {
    const service = new ExcelGeneratorService();

    const report: ExcelReportDefinition<TestRow> = {
      sheetName: 'Test',
      columns: [
        { header: 'Area', key: 'area.name', width: 20 },
        {
          header: 'Estado',
          key: 'status',
          transform: (value) => (value ? 'Sí' : 'No'),
        },
      ],
      renderOptions: {
        enableBorders: false,
        enableAutoFilter: false,
        enableAutoFit: false,
      },
    };

    const buffer = await service.generateExcelBuffer<TestRow>(
      [{ area: { name: 'A-1' }, status: true }],
      report,
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet('Test');
    expect(sheet).toBeDefined();

    const headerRow = sheet!.getRow(1);
    const dataRow = sheet!.getRow(2);

    expect(headerRow.getCell(1).value).toBe('Area');
    expect(headerRow.getCell(2).value).toBe('Estado');

    expect(dataRow.getCell(1).value).toBe('A-1');
    expect(dataRow.getCell(2).value).toBe('Sí');
  });

  it('resiliencia: si el transform falla, pone celda vacía', async () => {
    const service = new ExcelGeneratorService();

    const report: ExcelReportDefinition<TestRow> = {
      sheetName: 'Test',
      columns: [
        { header: 'Area', key: 'area.name', width: 20 },
        {
          header: 'Estado',
          key: 'status',
          transform: () => {
            throw new Error('boom');
          },
        },
      ],
      renderOptions: {
        enableBorders: false,
        enableAutoFilter: false,
        enableAutoFit: false,
      },
    };

    const buffer = await service.generateExcelBuffer<TestRow>(
      [{ area: { name: 'A-1' }, status: true }],
      report,
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Test');

    const dataRow = sheet!.getRow(2);
    expect(dataRow.getCell(1).value).toBe('A-1');

    // ExcelJS puede retornar `null` o `''` según el valor.
    const value = dataRow.getCell(2).value;
    expect(value == null || String(value) === '').toBe(true);
  });

  it('streaming: escribe un Excel sin almacenar archivos', async () => {
    const service = new ExcelGeneratorService();

    const report: ExcelReportDefinition<TestRow> = {
      sheetName: 'Test',
      columns: [
        { header: 'Area', key: 'area.name', width: 20 },
        { header: 'Estado', key: 'status' },
      ],
      renderOptions: {
        enableBorders: false,
        enableAutoFilter: false,
        enableAutoFit: false,
      },
    };

    const pass = new PassThrough();
    const chunks: Buffer[] = [];
    pass.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

    await service.streamExcelToWritable(
      [{ area: { name: 'A-1' }, status: true }],
      report,
      pass,
    );

    // Para este test verificamos que se escribieron bytes al stream.
    const buffer = Buffer.concat(chunks);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

