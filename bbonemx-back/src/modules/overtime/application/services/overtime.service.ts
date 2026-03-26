import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { OvertimeRepository } from '../../infrastructure/repositories';
import { TechniciansService } from 'src/modules/catalogs/technicians/application/services';
import { CreateOvertimeInput, UpdateOvertimeInput } from '../dto';
import { Overtime } from '../../domain/entities';
import { User } from 'src/modules/users/domain/entities';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import {
  ExcelGeneratorService,
  ExcelReportDefinition,
} from 'src/infrastructure/excel';
import { PdfTableDefinition } from 'src/infrastructure/pdf';
import {
  AREA_NAME,
  COMPANY_NAME,
  formatOvertimePeriodLabel,
  OVERTIME_EXCEL_REPORT,
  OVERTIME_PDF_REPORT,
} from '../constants/overtime-export.constants';

export interface OvertimeExportFilters {
  startDate?: string;
  endDate?: string;
  technicianId?: string;
  positionId?: string;
  reasonForPayment?: ReasonForPayment;
}

export interface OvertimeReportHeaderInput {
  periodFrom?: string;
  periodTo?: string;
}

@Injectable()
export class OvertimeService {
  private readonly logger = new Logger(OvertimeService.name);

  constructor(
    private readonly overtimeRepository: OvertimeRepository,
    private readonly techniciansService: TechniciansService,
    private readonly excelGeneratorService: ExcelGeneratorService,
  ) {}

  async findAll(filters?: OvertimeExportFilters): Promise<Overtime[]> {
    return this.overtimeRepository.findAll(filters);
  }

  async countForExport(filters?: OvertimeExportFilters): Promise<number> {
    return this.overtimeRepository.countForExport(filters);
  }

  private buildExcelReportWithHeader(
    header?: OvertimeReportHeaderInput,
  ): ExcelReportDefinition<Overtime> {
    const elaborationDate = new Date();
    const periodLabel = formatOvertimePeriodLabel(
      header?.periodFrom,
      header?.periodTo,
    );

    // Por compatibilidad con ExcelGeneratorService, definimos una “pre-tabla” en 3 filas,
    // colocando izquierda “Empresa/Área” y derecha “Fechas”. El estilo visual completo
    // (colores/underline/align fino) puede afinarse después si lo necesitas 1:1.
    return {
      ...OVERTIME_EXCEL_REPORT,
      preRows: [
        [
          'Empresa:',
          COMPANY_NAME,
          '',
          '',
          'Fecha de elaboración',
          this.formatDateForExcel(elaborationDate),
          '',
          '',
        ],
        [
          'AREA:',
          AREA_NAME,
          '',
          '',
          'Fecha de entrega a nómina',
          this.formatDateForExcel(elaborationDate),
          '',
          '',
        ],
        ['PERIODO:', periodLabel, '', '', '', '', '', ''],
      ],
    };
  }

  private formatDateForExcel(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  buildPdfReportWithHeader(
    header?: OvertimeReportHeaderInput,
  ): PdfTableDefinition<Overtime> {
    const elaborationDate = this.formatDateForExcel(new Date());
    const periodLabel = formatOvertimePeriodLabel(
      header?.periodFrom,
      header?.periodTo,
    );

    return {
      ...OVERTIME_PDF_REPORT,
      renderOptions: {
        ...(OVERTIME_PDF_REPORT.renderOptions ?? {}),
        title: '',
        subtitle: '',
        topHeader: {
          empresa: { label: 'Empresa:', value: COMPANY_NAME },
          area: { label: 'AREA:', value: AREA_NAME },
          fechaElaboracion: {
            label: 'Fecha de elaboración',
            value: elaborationDate,
          },
          fechaEntrega: {
            label: 'Fecha de entrega a nómina',
            value: elaborationDate,
          },
          periodo: { label: 'PERIODO:', value: periodLabel },
          labelColor: '000000',
          valueColor: 'C00000',
        },
      },
    };
  }

  async exportToExcelBuffer(
    filters?: OvertimeExportFilters,
    header?: OvertimeReportHeaderInput,
  ): Promise<Buffer> {
    const startedAt = Date.now();
    const data = await this.overtimeRepository.findAll(filters);
    const report = this.buildExcelReportWithHeader(header);
    const buffer = await this.excelGeneratorService.generateExcelBuffer(
      data,
      report,
    );

    this.logger.log('Exportación Overtime Excel completada', {
      rows: data.length,
      elapsedMs: Date.now() - startedAt,
    });
    return buffer;
  }

  async *streamOvertimeForPdf(
    filters?: OvertimeExportFilters,
    batchSize = 500,
  ): AsyncGenerator<Overtime, void, unknown> {
    let page = 1;
    for (;;) {
      const batch = await this.overtimeRepository.findForExportBatch(filters, {
        page,
        limit: batchSize,
      });
      if (batch.length === 0) return;
      for (const row of batch) yield row;
      page += 1;
    }
  }

  async findMyRecords(userId: string): Promise<Overtime[]> {
    const technician = await this.techniciansService.findByIdOrFail(userId);
    return this.overtimeRepository.findByTechnicianId(technician.id);
  }

  async findById(id: string): Promise<Overtime> {
    const record = await this.overtimeRepository.findById(id);
    if (!record)
      throw new NotFoundException(
        `Registro de horas extra con ID ${id} no encontrado`,
      );
    return record;
  }

  private async resolveTechnicianId(
    user: User,
    inputTechnicianId?: string,
  ): Promise<string> {
    // Si viene technicianId en el input → flujo admin (crear para otro técnico)
    if (inputTechnicianId) {
      return inputTechnicianId;
    }
    // Si no viene → buscar el técnico del usuario actual
    const technician = await this.techniciansService.findByIdOrFail(user.id);
    return technician.id;
  }

  async create(input: CreateOvertimeInput, user: User): Promise<Overtime> {
    const isAdmin = user.isAdmin();
    const technicianId = await this.resolveTechnicianId(
      user,
      input.technicianId,
    );

    const data: Partial<Overtime> = {
      workDate: new Date(input.workDate),
      startTime: input.startTime,
      endTime: input.endTime,
      activity: input.activity,
      technicianId,
    };

    if (isAdmin && input.reasonForPayment) {
      data.reasonForPayment = input.reasonForPayment;
    }

    return this.overtimeRepository.create(data);
  }

  async update(input: UpdateOvertimeInput, user: User): Promise<Overtime> {
    const record = await this.findById(input.id);
    const isAdmin = user.isAdmin();

    if (!isAdmin) {
      const technician = await this.techniciansService.findByIdOrFail(user.id);
      if (record.technicianId !== technician.id) {
        throw new ForbiddenException(
          'No tienes permiso para editar este registro',
        );
      }
      if (record.reasonForPayment != null) {
        throw new ForbiddenException(
          'No puedes editar un registro que ya tiene razón de pago asignada',
        );
      }
    }

    const data: Partial<Overtime> = {};
    if (input.workDate) data.workDate = new Date(input.workDate);
    if (input.startTime) data.startTime = input.startTime;
    if (input.endTime) data.endTime = input.endTime;
    if (input.activity !== undefined) data.activity = input.activity;
    if (isAdmin && input.reasonForPayment !== undefined) {
      data.reasonForPayment = input.reasonForPayment;
    }

    const updated = await this.overtimeRepository.update(input.id, data);
    if (!updated)
      throw new NotFoundException(`Registro con ID ${input.id} no encontrado`);
    return updated;
  }

  async delete(id: string, user: User): Promise<boolean> {
    const record = await this.findById(id);
    const isAdmin = user.isAdmin();

    if (!isAdmin) {
      const technician = await this.techniciansService.findByIdOrFail(user.id);
      if (record.technicianId !== technician.id) {
        throw new ForbiddenException(
          'No tienes permiso para eliminar este registro',
        );
      }
      if (record.reasonForPayment != null) {
        throw new ForbiddenException(
          'No puedes eliminar un registro que ya tiene razón de pago asignada',
        );
      }
    }

    await this.overtimeRepository.softDelete(id);
    return true;
  }
}
