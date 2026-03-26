import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { OvertimePdfController } from './overtime-pdf.controller';
import { OvertimeService } from '../../application/services';
import { PdfGeneratorService } from 'src/infrastructure/pdf';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

describe('OvertimePdfController', () => {
  it('devuelve headers correctos y un PDF (%PDF)', async () => {
    const mockOvertimeService = {
      streamOvertimeForPdf: async function* () {
        yield await Promise.resolve({ activity: 'Mantenimiento' } as Overtime);
      },
      buildPdfReportWithHeader: jest.fn().mockReturnValue({
        columns: [{ header: 'A', key: 'activity' }],
      }),
    } satisfies Partial<OvertimeService>;

    const mockPdfGeneratorService = {
      streamTablePdfToWritable: async (
        _data: unknown,
        _def: unknown,
        writable: NodeJS.WritableStream,
      ) => {
        writable.write(Buffer.from('%PDF-1.4\n'));
        writable.end();
        return Promise.resolve();
      },
    } satisfies Partial<PdfGeneratorService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [OvertimePdfController],
      providers: [
        { provide: OvertimeService, useValue: mockOvertimeService },
        { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
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

    const filename = 'test-horas-extra.pdf';
    const res = await request(app.getHttpServer() as import('http').Server)
      .post('/api/overtime/export/pdf')
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
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
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain(filename);
    expect((res.body as Buffer).subarray(0, 4).toString('utf8')).toBe('%PDF');

    expect(mockOvertimeService.buildPdfReportWithHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        periodFrom: '2026-03-01',
        periodTo: '2026-03-15',
      }),
    );

    await app.close();
  });
});
