import * as ExcelJS from 'exceljs';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { OvertimeExcelController } from './overtime-excel.controller';
import { OvertimeService } from '../../application/services';
import { ExcelGeneratorService } from 'src/infrastructure/excel';
import { OVERTIME_EXCEL_REPORT } from '../../application/constants/overtime-export.constants';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

describe('OvertimeExcelController', () => {
  it('devuelve headers correctos y un Excel descargable', async () => {
    const excelGeneratorService = new ExcelGeneratorService();
    const buffer = await excelGeneratorService.generateExcelBuffer([], {
      ...OVERTIME_EXCEL_REPORT,
      preRows: [],
    });

    const mockOvertimeService = {
      exportToExcelBuffer: jest.fn().mockResolvedValue(buffer),
    } satisfies Partial<OvertimeService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [OvertimeExcelController],
      providers: [{ provide: OvertimeService, useValue: mockOvertimeService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['graphql'] });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const filename = 'test-horas-extra.xlsx';
    const res = await request(app.getHttpServer())
      .post('/api/overtime/export/excel')
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .send({
        filename,
        filters: { startDate: '2026-03-01', endDate: '2026-03-15' },
        periodFrom: '2026-03-01',
        periodTo: '2026-03-15',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain(filename);
    expect((res.body as Buffer).length).toBeGreaterThan(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(res.body as Buffer);
    const sheet = workbook.getWorksheet('Horas extra');
    expect(sheet).toBeDefined();

    expect(mockOvertimeService.exportToExcelBuffer).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: '2026-03-01', endDate: '2026-03-15' }),
      expect.objectContaining({ periodFrom: '2026-03-01', periodTo: '2026-03-15' }),
    );

    await app.close();
  });
});

