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

import { ExportDashboardChartsPdfBodyDto } from './dto/export-dashboard-charts-pdf.dto';

@Controller('dashboard')
export class DashboardChartsPdfController {
  private readonly logger = new Logger(DashboardChartsPdfController.name);

  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {}

  @Post('export/charts-pdf')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportChartsPdf(
    @Body() body: ExportDashboardChartsPdfBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filename =
      body.filename?.trim() ||
      `dashboard-graficas-${new Date().toISOString().slice(0, 10)}.pdf`;

    const items = body.items.map((i) => ({
      title: i.title,
      imageDataUrl: i.imageDataUrl,
    }));

    this.pdfGeneratorService.preflightChartsPdfItems(items);

    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      await this.pdfGeneratorService.streamChartsPdfToWritable(
        {
          documentTitle: body.documentTitle,
          subtitle: body.subtitle,
          items,
        },
        res,
      );
      if (!res.writableEnded) {
        res.end();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando PDF de gráficas del dashboard', {
        filename,
        err: message,
      });
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: 'Error al exportar PDF del dashboard' });
        return;
      }
      res.end();
    }
  }
}
