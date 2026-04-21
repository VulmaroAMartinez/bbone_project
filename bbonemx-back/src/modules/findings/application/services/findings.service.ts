import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { FindingsRepository } from '../../infrastructure/repositories';
import {
  WorkOrdersService,
  WorkOrderPhotosService,
} from 'src/modules/work-orders';
import { Finding } from '../../domain/entities';
import {
  FindingFiltersInput,
  FindingPaginationInput,
  FindingSortInput,
} from '../dto';
import { FindingStatus, MaintenanceType, PhotoType } from 'src/common';
import { FindingPhotosService } from './finding-photos.service';

/** Basename seguro para leer desde `uploads/` (misma idea que `UploadsController.serve`). */
function resolveUploadBasename(filePath: string): string | null {
  if (!filePath?.trim()) return null;
  const noQuery = filePath.split('#')[0].split('?')[0];
  const normalized = noQuery.replace(/\\/g, '/');
  const parts = normalized.split('/').filter((s) => s.length > 0);
  const raw = parts[parts.length - 1];
  if (!raw) return null;
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '');
  return safe || null;
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function collectFindingPhotosForExport(
  finding: Finding,
  max: number,
): { filePath: string; mimeType: string }[] {
  const seen = new Set<string>();
  const out: { filePath: string; mimeType: string }[] = [];

  const add = (path: string | undefined | null, mimeType: string) => {
    if (!path || out.length >= max) return;
    const base = resolveUploadBasename(path);
    if (!base || seen.has(base)) return;
    seen.add(base);
    out.push({ filePath: path, mimeType });
  };

  if (finding.photoPath) {
    const base = resolveUploadBasename(finding.photoPath);
    add(finding.photoPath, base ? mimeFromFilename(base) : 'image/jpeg');
  }

  for (const ph of finding.photos ?? []) {
    if (out.length >= max) break;
    add(ph.filePath, ph.mimeType);
  }

  return out;
}

@Injectable()
export class FindingsService {
  private readonly logger = new Logger(FindingsService.name);

  constructor(
    private readonly findingsRepository: FindingsRepository,
    private readonly workOrdersService: WorkOrdersService,
    private readonly workOrderPhotosService: WorkOrderPhotosService,
    private readonly findingPhotosService: FindingPhotosService,
  ) {}

  /**
   * Dimensiones naturales (máx. borde MAX_EDGE px) y payload para Excel.
   * WebP → PNG; el redimensionado solo aplica si excede MAX_EDGE.
   */
  private async prepareImageForExcelCell(
    absolutePath: string,
    mimeType: string,
  ): Promise<{
    encoded: { base64: string; extension: 'jpeg' | 'png' | 'gif' };
    widthPx: number;
    heightPx: number;
  } | null> {
    const MAX_EDGE = 2400;
    try {
      const sharp = (await import('sharp')).default;
      const raw = readFileSync(absolutePath);
      const m = mimeType.toLowerCase();

      const buf =
        m === 'image/webp'
          ? Buffer.from(await sharp(raw).png().toBuffer())
          : raw;

      const { data, info } = await sharp(buf, {
        animated: false,
        limitInputPixels: false,
      })
        .resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer({ resolveWithObject: true });

      const w = info.width;
      const h = info.height;
      if (!w || !h) return null;

      const fmt = info.format;
      const extension: 'jpeg' | 'png' | 'gif' =
        fmt === 'jpeg' || fmt === 'jpg'
          ? 'jpeg'
          : fmt === 'gif'
            ? 'gif'
            : 'png';

      return {
        encoded: { base64: data.toString('base64'), extension },
        widthPx: w,
        heightPx: h,
      };
    } catch (err) {
      this.logger.warn('Error leyendo o convirtiendo imagen para Excel', {
        path: absolutePath,
        err: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  findAll(): Promise<Finding[]> {
    return this.findingsRepository.findAll();
  }

  findAllWithDeleted(): Promise<Finding[]> {
    return this.findingsRepository.findAllWithDeleted();
  }

  findAllOpen(): Promise<Finding[]> {
    return this.findingsRepository.findAllOpen();
  }

  findById(id: string): Promise<Finding | null> {
    return this.findingsRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<Finding> {
    const finding = await this.findingsRepository.findById(id);
    if (!finding) {
      throw new NotFoundException('Hallazgo no encontrado');
    }
    return finding;
  }

  findByFolio(folio: string): Promise<Finding | null> {
    return this.findingsRepository.findByFolio(folio);
  }

  findByCreatedBy(createdBy: string): Promise<Finding[]> {
    return this.findingsRepository.findByCreatedBy(createdBy);
  }

  findByAreaId(areaId: string): Promise<Finding[]> {
    return this.findingsRepository.findByAreaId(areaId);
  }

  findWithFilters(
    filters?: FindingFiltersInput,
    pagination?: FindingPaginationInput,
    sort?: FindingSortInput,
  ): Promise<{ data: Finding[]; total: number }> {
    return this.findingsRepository.findWithFilters(filters, pagination, sort);
  }

  getStatsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.findingsRepository.getStatsByStatus();
  }

  countOpen(): Promise<number> {
    return this.findingsRepository.countOpen();
  }

  findCountByDate(date: string): Promise<number> {
    return this.findingsRepository.findCountByDate(date);
  }

  assignCollectionByDate(date: string, collection: string): Promise<number> {
    return this.findingsRepository.assignCollectionByDate(date, collection);
  }

  async exportToExcelBuffer(filters?: FindingFiltersInput): Promise<Buffer> {
    const findings = await this.findingsRepository.findAllForExport(filters);

    const HEADER_COLOR = '1F4E79';
    const PHOTO_COL = 4; // 1-based column number
    const MAX_PHOTOS_PER_ROW = 3;
    /** Ancho fijo columna Fotos (unidades Excel ≈ ancho de “0”). */
    const PHOTO_COL_CHARS = 40;
    const GAP_PX = 6;
    const PAD_PX = 5;
    const DEFAULT_DATA_ROW_PT = 22;
    /** Alto máximo por foto dentro de la celda (px en pantalla ~96dpi). */
    const MAX_SLOT_HEIGHT_PX = 168;

    type PreparedCellImage = {
      encoded: { base64: string; extension: 'jpeg' | 'png' | 'gif' };
      widthPx: number;
      heightPx: number;
    };

    const preparedByRow: PreparedCellImage[][] = [];
    for (const finding of findings) {
      const refs = collectFindingPhotosForExport(finding, MAX_PHOTOS_PER_ROW);
      const cells: PreparedCellImage[] = [];
      for (const ref of refs) {
        const filename = resolveUploadBasename(ref.filePath);
        if (!filename) continue;
        const absolutePath = join(process.cwd(), 'uploads', filename);
        if (!existsSync(absolutePath)) continue;
        const cell = await this.prepareImageForExcelCell(
          absolutePath,
          ref.mimeType,
        );
        if (cell) cells.push(cell);
      }
      preparedByRow.push(cells);
    }

    const photoColWidthPx = Math.round(PHOTO_COL_CHARS * 7 + 5);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hallazgos');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Actividad/Descripción', key: 'descripcion', width: 50 },
      { header: 'Fotos', key: 'fotos', width: PHOTO_COL_CHARS },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: HEADER_COLOR },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 4 },
    };

    const colBase = PHOTO_COL - 1;

    for (let idx = 0; idx < findings.length; idx++) {
      const finding = findings[idx];
      const cellImages = preparedByRow[idx];

      const fecha = finding.createdAt
        ? new Date(finding.createdAt).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '-';

      const row = worksheet.addRow({
        fecha,
        area: finding.area?.name ?? '-',
        descripcion: finding.description ?? '-',
        fotos: '',
      });

      const nPhotos = cellImages.length;
      const innerPx = photoColWidthPx - 2 * PAD_PX;
      const slotW =
        nPhotos > 0
          ? (innerPx - (nPhotos - 1) * GAP_PX) / nPhotos
          : 0;

      const sized =
        nPhotos > 0
          ? cellImages.map((img) => {
              let scale = Math.min(
                slotW / img.widthPx,
                MAX_SLOT_HEIGHT_PX / img.heightPx,
                1,
              );
              let dw = Math.max(1, Math.round(img.widthPx * scale));
              let dh = Math.max(1, Math.round(img.heightPx * scale));
              if (dw > slotW && dw > 0) {
                const f = slotW / dw;
                dw = Math.floor(slotW);
                dh = Math.max(1, Math.round(dh * f));
              }
              return { img, dw, dh };
            })
          : [];

      const maxImgH =
        sized.length > 0 ? Math.max(...sized.map((s) => s.dh)) : 0;
      const rowHeightPx =
        nPhotos > 0 ? maxImgH + 2 * PAD_PX : (DEFAULT_DATA_ROW_PT * 96) / 72;
      const rowHeightPt =
        nPhotos > 0
          ? Math.max(18, (rowHeightPx * 72) / 96)
          : DEFAULT_DATA_ROW_PT;

      row.height = rowHeightPt;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (colNumber < PHOTO_COL) {
          cell.alignment = { vertical: 'top', wrapText: true };
        }
      });

      const rowBase = row.number - 1;

      for (let p = 0; p < sized.length; p++) {
        const { img, dw, dh } = sized[p];
        try {
          const slotLeftPx = PAD_PX + p * (slotW + GAP_PX);
          const offsetPx = slotLeftPx + (slotW - dw) / 2;
          const topPx = PAD_PX + (maxImgH - dh) / 2;

          const imageId = workbook.addImage(img.encoded);
          const colFrac = offsetPx / photoColWidthPx;
          const rowFrac = topPx / rowHeightPx;

          worksheet.addImage(imageId, {
            tl: {
              col: colBase + colFrac,
              row: rowBase + rowFrac,
            },
            ext: { width: dw, height: dh },
            editAs: 'oneCell',
          });
        } catch (err) {
          this.logger.warn('No se pudo incrustar una foto en el Excel de hallazgos', {
            findingId: finding.id,
            err: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    const rawBuffer = await workbook.xlsx.writeBuffer();
    this.logger.log('Excel de hallazgos generado', {
      rows: findings.length,
    });
    return rawBuffer as unknown as Buffer;
  }

  async create(data: Partial<Finding>): Promise<Finding> {
    return this.findingsRepository.create(data);
  }

  async update(id: string, data: Partial<Finding>): Promise<Finding | null> {
    await this.findByIdOrFail(id);
    return this.findingsRepository.update(id, data);
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.findingsRepository.softDelete(id);
  }

  async convertToWorkOrder(id: string): Promise<Finding> {
    const finding = await this.findByIdOrFail(id);
    if (!finding.canBeConvertedToWo())
      throw new BadRequestException(
        'El hallazgo no puede ser convertido a orden de trabajo',
      );

    const workOrder = await this.workOrdersService.create(
      {
        areaId: finding.areaId,
        description: finding.description,
        machineId: finding.machineId,
      },
      finding.createdBy || '',
    );

    await this.workOrdersService.update(workOrder.id, {
      maintenanceType: MaintenanceType.FINDING,
    });

    await this.workOrdersService.linkFinding(workOrder.id, id);

    const photoSources: Array<{
      filePath: string;
      fileName: string;
      mimeType: string;
    }> = [];

    if (finding.photoPath) {
      const fileName =
        finding.photoPath.split('/').pop() || 'finding-photo.jpg';
      const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
      const mimeType =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';
      photoSources.push({ filePath: finding.photoPath, fileName, mimeType });
    }

    const findingPhotos = await this.findingPhotosService.findByFindingId(id);
    for (const fp of findingPhotos) {
      photoSources.push({
        filePath: fp.filePath,
        fileName: fp.fileName,
        mimeType: fp.mimeType,
      });
    }

    for (const source of photoSources) {
      try {
        await this.workOrderPhotosService.create(
          {
            workOrderId: workOrder.id,
            photoType: PhotoType.BEFORE,
            filePath: source.filePath,
            fileName: source.fileName,
            mimeType: source.mimeType,
          },
          finding.createdBy || '',
        );
      } catch (err) {
        this.logger.warn(
          `No se pudo copiar foto del hallazgo ${id} a OT ${workOrder.id}: ${err}`,
        );
      }
    }

    await this.findingsRepository.update(id, {
      status: FindingStatus.CONVERTED_TO_WO,
      convertedToWoId: workOrder.id,
      convertedAt: new Date(),
      convertedBy: finding.createdBy,
    });

    return this.findByIdOrFail(id);
  }
}
