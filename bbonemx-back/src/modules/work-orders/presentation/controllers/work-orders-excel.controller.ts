import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import type { Response } from 'express';

import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import {
  WorkOrderFiltersInput,
  WorkOrderSortField,
  WorkOrderSortInput,
  SortOrder,
} from '../../application/dto/work-order-filters.dto';
import { WorkOrdersService } from '../../application/services/work-orders.service';

class ExportWorkOrdersExcelBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkOrderFiltersInput)
  filters?: WorkOrderFiltersInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkOrderSortInput)
  sort?: WorkOrderSortInput;

  @IsOptional()
  @IsString()
  filename?: string;
}

@Controller('work-orders')
export class WorkOrdersExcelController {
  private readonly logger = new Logger(WorkOrdersExcelController.name);
  private readonly STREAMING_ROW_THRESHOLD = 1500;
  private readonly BATCH_SIZE = 500;

  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportExcel(
    @Body() body: ExportWorkOrdersExcelBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const sort = body?.sort ?? {
      field: WorkOrderSortField.CREATED_AT,
      order: SortOrder.DESC,
    };

    const filename =
      body?.filename ??
      `ordenes-trabajo-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    const rowCount = await this.workOrdersService.countForExcelExport(filters);

    try {
      if (rowCount > this.STREAMING_ROW_THRESHOLD) {
        await this.workOrdersService.streamToExcel(
          filters,
          sort,
          res,
          this.BATCH_SIZE,
        );

        if (!res.writableEnded) {
          res.end();
        }
        return;
      }

      const buffer = await this.workOrdersService.exportToExcelBuffer(
        filters,
        sort,
      );
      res.status(200).end(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando órdenes de trabajo a Excel', {
        filename,
        rowCount,
        err: message,
      });

      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al exportar órdenes de trabajo a Excel',
        });
        return;
      }

      res.end();
    }
  }
}
