import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { DashboardChartsPdfController } from './dashboard-charts-pdf.controller';
import { PdfGeneratorService } from 'src/infrastructure/pdf';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('DashboardChartsPdfController', () => {
  it('devuelve PDF (%PDF) con body válido', async () => {
    const mockPdf = {
      preflightChartsPdfItems: jest.fn(),
      streamChartsPdfToWritable: async (
        _opts: unknown,
        writable: NodeJS.WritableStream,
      ) => {
        writable.write(Buffer.from('%PDF-1.4\n'));
        writable.end();
      },
    } satisfies Partial<PdfGeneratorService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [DashboardChartsPdfController],
      providers: [{ provide: PdfGeneratorService, useValue: mockPdf }],
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

    const res = await request(app.getHttpServer())
      .post('/api/dashboard/export/charts-pdf')
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .send({
        filename: 'dash.pdf',
        documentTitle: 'Dashboard',
        subtitle: 'Test',
        items: [{ title: 'G1', imageDataUrl: tinyPng }],
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect((res.body as Buffer).subarray(0, 4).toString('utf8')).toBe('%PDF');

    await app.close();
  });
});
