import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { OvertimeService } from '../../application/services';
import { ExportOvertimeBodyDto } from './dto/export-overtime.dto';

@Controller('overtime')
export class OvertimeExcelController {
  private readonly logger = new Logger(OvertimeExcelController.name);

  constructor(private readonly overtimeService: OvertimeService) {}

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async exportExcel(
    @Body() body: ExportOvertimeBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const periodFrom = body?.periodFrom ?? filters.startDate;
    const periodTo = body?.periodTo ?? filters.endDate;
    const filename =
      body?.filename ??
      `horas-extra-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const buffer = await this.overtimeService.exportToExcelBuffer(filters, {
        periodFrom,
        periodTo,
      });
      res.status(200).end(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando Overtime a Excel', {
        filename,
        err: message,
      });

      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: 'Error al exportar horas extra a Excel' });
        return;
      }

      res.end();
    }
  }
}
