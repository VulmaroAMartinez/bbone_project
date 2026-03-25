import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ExcelColumnDefinition } from './excel-column.interface';
import type { ExcelReportDefinition, ExcelRenderOptions } from './excel-report-definition';

@Injectable()
export class ExcelGeneratorService {
  private readonly logger = new Logger(ExcelGeneratorService.name);

  private getNestedValue(key: string, obj: any): any {
    return key.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
  }

  private getDefaultRenderOptions(): Required<ExcelRenderOptions> {
    return {
      headerColor: '1F4E79',
      enableBorders: true,
      enableAutoFilter: true,
      enableAutoFit: true,
      maxColumnWidth: 50,
    };
  }

  private resolveRenderOptions(report?: ExcelReportDefinition<any>): Required<ExcelRenderOptions> {
    const defaults = this.getDefaultRenderOptions();
    return {
      ...defaults,
      ...(report?.renderOptions ?? {}),
    };
  }

  private validateReportDefinition(report: ExcelReportDefinition<any>): void {
    if (!report?.sheetName) {
      throw new BadRequestException('sheetName es requerido para el reporte Excel');
    }
    if (!Array.isArray(report.columns) || report.columns.length === 0) {
      throw new BadRequestException('columns debe ser un arreglo no vacío para el reporte Excel');
    }
  }

  private buildRowData<T>(
    row: T,
    columns: ExcelColumnDefinition<T>[],
  ): Record<string, any> {
    const rowData: Record<string, any> = {};

    for (const col of columns) {
      const raw = this.getNestedValue(col.key, row);
      if (col.transform) {
        try {
          rowData[col.key] = col.transform(raw, row);
        } catch (err) {
          this.logger.warn('Error aplicando transform para Excel', {
            key: col.key,
            err: err instanceof Error ? err.message : String(err),
          });
          rowData[col.key] = '';
        }
        continue;
      }
      rowData[col.key] = raw ?? '';
    }

    return rowData;
  }

  private styleHeaderRowBuffer(
    worksheet: ExcelJS.Worksheet,
    report: ExcelReportDefinition<any>,
  ): void {
    const render = this.resolveRenderOptions(report);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: render.headerColor },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (render.enableBorders) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    });
  }

  private styleDataRowsBuffer(
    worksheet: ExcelJS.Worksheet,
    report: ExcelReportDefinition<any>,
  ): void {
    const render = this.resolveRenderOptions(report);
    if (!render.enableBorders) return;

    for (let i = 2; i <= worksheet.rowCount; i++) {
      worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  }

  async generateExcelBuffer<T>(
    data: Iterable<T>,
    report: ExcelReportDefinition<T>,
  ): Promise<Buffer> {
    this.validateReportDefinition(report);
    const render = this.resolveRenderOptions(report);
    if (!data || typeof (data as any)[Symbol.iterator] !== 'function') {
      throw new BadRequestException('data debe ser un iterable para generar el Excel');
    }

    const startedAt = Date.now();
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(report.sheetName);

      worksheet.columns = report.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
      }));

      let rows = 0;
      for (const row of data) {
        worksheet.addRow(this.buildRowData(row, report.columns));
        rows += 1;
      }

      this.styleHeaderRowBuffer(worksheet, report);
      this.styleDataRowsBuffer(worksheet, report);

      if (render.enableAutoFilter) {
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: report.columns.length },
        };
      }

      if (render.enableAutoFit) {
        for (const col of worksheet.columns) {
          let maxLength = col.header ? String(col.header).length : 10;
          col.eachCell?.({ includeEmpty: false }, (cell) => {
            const len = cell.value ? String(cell.value).length : 0;
            if (len > maxLength) maxLength = len;
          });
          col.width = Math.min(maxLength + 2, render.maxColumnWidth);
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      this.logger.log('Excel buffer generado', {
        sheetName: report.sheetName,
        rows,
        elapsedMs: Date.now() - startedAt,
      });
      return buffer as unknown as Buffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error generando Excel buffer', {
        sheetName: report.sheetName,
        elapsedMs: Date.now() - startedAt,
        err: message,
      });
      throw new InternalServerErrorException('Error al generar el archivo Excel');
    }
  }

  async streamExcelToWritable<T>(
    data: Iterable<T> | AsyncIterable<T>,
    report: ExcelReportDefinition<T>,
    writable: NodeJS.WritableStream,
  ): Promise<void> {
    this.validateReportDefinition(report);
    const render = this.resolveRenderOptions(report);
    const startedAt = Date.now();

    if (!writable || typeof (writable as any).write !== 'function') {
      throw new BadRequestException('writable debe ser un stream de escritura válido');
    }

    const hasSyncIterator = typeof (data as any)?.[Symbol.iterator] === 'function';
    const hasAsyncIterator = typeof (data as any)?.[Symbol.asyncIterator] === 'function';
    if (!data || (!hasSyncIterator && !hasAsyncIterator)) {
      throw new BadRequestException('data debe ser un iterable o async iterable para streamExcelToWritable');
    }

    const isAsyncIterable = (input: any): input is AsyncIterable<T> =>
      input && typeof input[Symbol.asyncIterator] === 'function';

    const toAsync = async function* (input: Iterable<T> | AsyncIterable<T>) {
      if (isAsyncIterable(input)) {
        yield* input;
        return;
      }
      for (const item of input as Iterable<T>) yield item;
    };

    // Nota: exceljs streaming no soporta “auto-fit” de manera eficiente
    // (requiere conocer longitudes globales). Lo dejamos deshabilitado por defecto.
    if (render.enableAutoFit) {
      this.logger.warn('enableAutoFit ignorado en modo stream (ExcelJS streaming).', {
        sheetName: report.sheetName,
      });
    }

    if (render.enableAutoFilter) {
      this.logger.warn('enableAutoFilter no garantizado en modo stream (ExcelJS streaming).', {
        sheetName: report.sheetName,
      });
    }

    try {
      const workbook = new (ExcelJS as any).stream.xlsx.WorkbookWriter({
        stream: writable,
        useStyles: true,
        useSharedStrings: true,
      });
      const worksheet = workbook.addWorksheet(report.sheetName);

      worksheet.columns = report.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
      }));

      // Estilo del header (row 1) si ExcelJS lo materializa al definir columns.
      const headerRow = worksheet.getRow(1) as any;
      headerRow.eachCell((cell: any) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: render.headerColor },
        };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (render.enableBorders) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
      if (typeof headerRow.commit === 'function') {
        headerRow.commit();
      }

      for await (const row of toAsync(data)) {
        const rowData = this.buildRowData(row, report.columns);
        const excelRow = worksheet.addRow(rowData);

        if (render.enableBorders) {
          for (let colIndex = 1; colIndex <= report.columns.length; colIndex++) {
            const cell = excelRow.getCell(colIndex);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }
        }

        excelRow.commit();
      }

      await workbook.commit();
      this.logger.log('Excel stream generado exitosamente', {
        sheetName: report.sheetName,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error generando Excel stream', {
        sheetName: report.sheetName,
        elapsedMs: Date.now() - startedAt,
        err: message,
      });
      throw new InternalServerErrorException('Error al generar el archivo Excel');
    }
  }

  async generateExcelBase64<T>(
    data: T[],
    columns: ExcelColumnDefinition<T>[],
    sheetName: string,
    headerColor?: string,
  ): Promise<string> {
    const report: ExcelReportDefinition<T> = {
      sheetName,
      columns,
      renderOptions: {
        headerColor,
      },
    };
    const buffer = await this.generateExcelBuffer(data, report);
    return buffer.toString('base64');
  }

  /**
   * Compatibilidad con el método anterior (se conserva por posibles usos no auditados).
   */
  async generateExcel<T>(
    data: T[],
    columns: ExcelColumnDefinition<T>[],
    sheetName: string,
    headerColor = '1F4E79',
  ): Promise<Buffer> {
    const report: ExcelReportDefinition<T> = {
      sheetName,
      columns,
      renderOptions: { headerColor },
    };
    return this.generateExcelBuffer(data, report);
  }
}
