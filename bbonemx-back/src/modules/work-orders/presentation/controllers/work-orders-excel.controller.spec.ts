import * as ExcelJS from 'exceljs';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('../../application/services/work-orders.service', () => ({
  WorkOrdersService: class WorkOrdersService {},
}));

import { WorkOrdersExcelController } from './work-orders-excel.controller';

interface WorkOrdersExcelService {
  countForExcelExport(filters: unknown): Promise<number>;
  exportToExcelBuffer(filters: unknown, sort: unknown): Promise<Buffer>;
  streamToExcel(
    filters: unknown,
    sort: unknown,
    writable: NodeJS.WritableStream,
    batchSize?: number,
  ): Promise<void>;
}
import { ExcelGeneratorService } from '../../../../infrastructure/excel';
import { WORK_ORDER_EXCEL_REPORT } from '../../application/constants/work-order-excel.constants';
import { WorkOrdersService } from '../../application/services/work-orders.service';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

describe('WorkOrdersExcelController', () => {
  it('devuelve headers correctos y un Excel descargable', async () => {
    const excelGeneratorService = new ExcelGeneratorService();
    const buffer = await excelGeneratorService.generateExcelBuffer(
      [],
      WORK_ORDER_EXCEL_REPORT,
    );

    const mockWorkOrdersService = {
      countForExcelExport: jest.fn().mockResolvedValue(0),
      exportToExcelBuffer: jest.fn().mockResolvedValue(buffer),
      streamToExcel: jest.fn(),
    } satisfies WorkOrdersExcelService;

    const moduleRef = await Test.createTestingModule({
      controllers: [WorkOrdersExcelController],
      providers: [
        {
          provide: WorkOrdersService,
          useValue: mockWorkOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app =
      moduleRef.createNestApplication<
        import('@nestjs/common').INestApplication
      >();
    app.setGlobalPrefix('api', { exclude: ['graphql'] });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const filename = 'test-ordenes-trabajo.xlsx';
    const res = await request(app.getHttpServer() as import('http').Server)
      .post('/api/work-orders/export/excel')
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .send({
        filename,
        filters: {},
        sort: { field: 'CREATED_AT', order: 'DESC' },
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain(filename);
    const bytes = res.body as Buffer;
    expect(bytes.length).toBeGreaterThan(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes);
    const sheet = workbook.getWorksheet('Órdenes de trabajo');
    expect(sheet).toBeDefined();
    expect(sheet!.getRow(1).getCell(1).value).toBe('Folio');
    expect(sheet!.getRow(1).getCell(2).value).toBe('Estado');

    await app.close();
  }, 30_000);
});
