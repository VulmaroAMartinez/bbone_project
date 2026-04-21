import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/role.enum';
import { FindingsService } from '../../application/services/findings.service';
import { FindingFiltersInput } from '../../application/dto/finding-filters.dto';

class ExportFindingsExcelBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FindingFiltersInput)
  filters?: FindingFiltersInput;
}

@Controller('findings')
export class FindingsExcelController {
  private readonly logger = new Logger(FindingsExcelController.name);

  constructor(private readonly findingsService: FindingsService) {}

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportExcel(
    @Body() body: ExportFindingsExcelBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const filename = `hallazgos-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const buffer = await this.findingsService.exportToExcelBuffer(filters);
      res.status(200).end(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando hallazgos a Excel', {
        filename,
        err: message,
      });

      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al exportar hallazgos a Excel' });
        return;
      }

      res.end();
    }
  }
}
