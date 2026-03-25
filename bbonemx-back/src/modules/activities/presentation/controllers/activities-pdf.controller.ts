import {
  Body,
  Controller,
  Logger,
  Post,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

import {
  ActivityFiltersInput,
  ActivitySortField,
  ActivitySortInput,
} from '../../application/dto/activity-filters.dto';
import { SortOrder } from '../../../work-orders/application/dto/work-order-filters.dto';
import { ActivitiesService } from '../../application/services/activities.service';
import { PdfGeneratorService } from 'src/infrastructure/pdf';
import { ACTIVITY_PDF_REPORT } from '../../application/constants/activity-excel-columns';

class ExportActivitiesPdfBodyDto {
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
export class ActivitiesPdfController {
  private readonly logger = new Logger(ActivitiesPdfController.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post('export/pdf')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportPdf(
    @Body() body: ExportActivitiesPdfBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    const filters = body?.filters ?? {};
    const sort = body?.sort ?? {
      field: ActivitySortField.CREATED_AT,
      order: SortOrder.DESC,
    };

    const filename =
      body?.filename ??
      `actividades-${new Date().toISOString().split('T')[0]}.pdf`;

    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    try {
      // Stream por lotes para evitar cargar todo en memoria.
      const data = this.activitiesService.streamActivitiesForPdf(filters, sort, this.BATCH_SIZE);
      await this.pdfGeneratorService.streamTablePdfToWritable(
        data,
        ACTIVITY_PDF_REPORT,
        res,
      );

      if (!res.writableEnded) {
        res.end();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error exportando actividades a PDF', {
        filename,
        err: message,
      });

      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al exportar actividades a PDF' });
        return;
      }
      res.end();
    }
  }
}

