import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { User } from '../../../users/domain/entities';
import type { Response } from 'express';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import {
  ActivityFiltersInput,
  ActivitySortInput,
  ActivitySortField,
} from '../../application/dto/activity-filters.dto';
import { SortOrder } from '../../../work-orders/application/dto/work-order-filters.dto';
import { ActivitiesService } from '../../application/services/activities.service';

class ExportActivitiesExcelBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityFiltersInput)
  filters?: ActivityFiltersInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivitySortInput)
  sort?: ActivitySortInput;

  @IsOptional()
  @IsString()
  filename?: string;
}

@Controller('activities')
export class ActivitiesExcelController {
  private readonly logger = new Logger(ActivitiesExcelController.name);
  private readonly STREAMING_ROW_THRESHOLD = 1500;
  private readonly BATCH_SIZE = 500;

  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportExcel(
    @Body() body: ExportActivitiesExcelBodyDto,
    @Res() res: Response,
    @CurrentUser() user: User,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const sort = body?.sort ?? {
      field: ActivitySortField.CREATED_AT,
      order: SortOrder.DESC,
    };

    const filename =
      body?.filename ??
      `actividades-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    const rowCount = await this.activitiesService.countForExcelExport(
      filters,
      user,
    );

    try {
      if (rowCount > this.STREAMING_ROW_THRESHOLD) {
        await this.activitiesService.streamToExcel(
          filters,
          sort,
          res,
          this.BATCH_SIZE,
          user,
        );

        if (!res.writableEnded) {
          res.end();
        }
        return;
      }

      const buffer = await this.activitiesService.exportToExcelBuffer(
        filters,
        sort,
        user,
      );
      res.status(200).end(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando actividades a Excel', {
        filename,
        rowCount,
        err: message,
      });

      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al exportar actividades a Excel',
        });
        return;
      }

      res.end();
    }
  }
}
