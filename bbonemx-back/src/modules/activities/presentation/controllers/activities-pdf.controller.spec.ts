import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ActivitiesPdfController } from './activities-pdf.controller';
import { ActivitiesService } from '../../application/services/activities.service';
import { PdfGeneratorService } from 'src/infrastructure/pdf';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

describe('ActivitiesPdfController', () => {
  it('devuelve headers correctos y un PDF (%PDF)', async () => {
    const mockActivitiesService = {
      streamActivitiesForPdf: async function* () {
        yield { activity: 'A' };
      },
    } satisfies Partial<ActivitiesService>;

    const mockPdfGeneratorService = {
      streamTablePdfToWritable: async (_data: any, _def: any, writable: NodeJS.WritableStream) => {
        writable.write(Buffer.from('%PDF-1.4\n'));
        writable.end();
      },
    } satisfies Partial<PdfGeneratorService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [ActivitiesPdfController],
      providers: [
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
      ],
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

    const filename = 'test-actividades.pdf';
    const res = await request(app.getHttpServer())
      .post('/api/activities/export/pdf')
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
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
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain(filename);
    expect((res.body as Buffer).subarray(0, 4).toString('utf8')).toBe('%PDF');

    await app.close();
  });
});

