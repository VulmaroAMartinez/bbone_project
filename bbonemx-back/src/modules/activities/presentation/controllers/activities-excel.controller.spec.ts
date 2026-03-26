import * as ExcelJS from 'exceljs';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ActivitiesExcelController } from './activities-excel.controller';
import { ActivitiesService } from '../../application/services/activities.service';
import { ExcelGeneratorService } from '../../../../infrastructure/excel';
import { ACTIVITY_EXCEL_REPORT } from '../../application/constants/activity-excel-columns';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

describe('ActivitiesExcelController', () => {
  it('devuelve headers correctos y un Excel descargable', async () => {
    const excelGeneratorService = new ExcelGeneratorService();
    const buffer = await excelGeneratorService.generateExcelBuffer(
      [],
      ACTIVITY_EXCEL_REPORT,
    );

    const mockActivitiesService = {
      countForExcelExport: jest.fn().mockResolvedValue(0),
      exportToExcelBuffer: jest.fn().mockResolvedValue(buffer),
      streamToExcel: jest.fn(),
    } satisfies Partial<ActivitiesService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [ActivitiesExcelController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
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

    const filename = 'test-actividades.xlsx';
    const res = await request(app.getHttpServer() as import('http').Server)
      .post('/api/activities/export/excel')
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
    const sheet = workbook.getWorksheet('Actividades');
    expect(sheet).toBeDefined();
    expect(sheet!.getRow(1).getCell(1).value).toBe('Área');
    expect(sheet!.getRow(1).getCell(3).value).toBe('Actividad');

    await app.close();
  });
});
