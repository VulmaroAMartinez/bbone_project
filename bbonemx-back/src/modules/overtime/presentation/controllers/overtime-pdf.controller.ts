import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { PdfGeneratorService } from 'src/infrastructure/pdf';
import { OvertimeService } from '../../application/services';
import { ExportOvertimeBodyDto } from './dto/export-overtime.dto';

@Controller('overtime')
export class OvertimePdfController {
  private readonly logger = new Logger(OvertimePdfController.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly overtimeService: OvertimeService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post('export/pdf')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async exportPdf(
    @Body() body: ExportOvertimeBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const periodFrom = body?.periodFrom ?? filters.startDate;
    const periodTo = body?.periodTo ?? filters.endDate;
    const filename =
      body?.filename ??
      `horas-extra-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const data = this.overtimeService.streamOvertimeForPdf(
        filters,
        this.BATCH_SIZE,
      );
      const report = this.overtimeService.buildPdfReportWithHeader({
        periodFrom,
        periodTo,
      });

      await this.pdfGeneratorService.streamTablePdfToWritable(
        data,
        report,
        res,
      );

      if (!res.writableEnded) {
        res.end();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando Overtime a PDF', {
        filename,
        err: message,
      });

      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: 'Error al exportar horas extra a PDF' });
        return;
      }

      res.end();
    }
  }
}
