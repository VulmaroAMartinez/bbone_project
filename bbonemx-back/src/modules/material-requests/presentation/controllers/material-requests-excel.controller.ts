import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/role.enum';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { User } from 'src/modules/users/domain/entities';
import { MaterialRequestsService } from '../../application/services';
import { MaterialRequestHistoryExportFiltersInput } from '../../application/dto';

class ExportMaterialRequestsExcelBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MaterialRequestHistoryExportFiltersInput)
  filters?: MaterialRequestHistoryExportFiltersInput;
}

@Controller('material-requests')
export class MaterialRequestsExcelController {
  private readonly logger = new Logger(MaterialRequestsExcelController.name);

  constructor(
    private readonly materialRequestsService: MaterialRequestsService,
  ) {}

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportExcel(
    @Body() body: ExportMaterialRequestsExcelBodyDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const filename = `solicitudes-material-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const buffer =
        await this.materialRequestsService.exportHistoryTrackingToExcelBuffer(
          user,
          filters,
        );
      res.status(200).end(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando solicitudes de material a Excel', {
        filename,
        err: message,
      });

      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al exportar solicitudes de material a Excel',
        });
        return;
      }

      res.end();
    }
  }
}
