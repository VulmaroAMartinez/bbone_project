import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { join, dirname } from 'path';
import * as fs from 'fs';
import { MaterialRequest } from '../../domain/entities/material-request.entity';
import { MaterialRequestItem } from '../../domain/entities/material-request-item.entity';
import { MaterialRequestPhoto } from '../../domain/entities/material-request-photo.entity';
import { MaterialRequestHistory } from '../../domain/entities/material-request-history.entity';
import { RequestCategory, RequestImportance, RequestPriority } from 'src/common';

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgente',
  SCHEDULED: 'Programada',
  CRITICAL: 'Crítico',
};

const IMPORTANCE_LABELS: Record<string, string> = {
  VERY_IMPORTANT: 'Muy importante',
  IMPORTANT: 'Importante',
  UNIMPORTANT: 'Poco importante',
};

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipo',
  PPE: 'Protección personal',
  TOOLS: 'Herramientas',
  MATERIAL_WITH_SKU: 'Material con SKU',
  NON_INVENTORY_MATERIAL: 'Material no Inventariado',
  REQUEST_SKU_MATERIAL: 'Solicitud de material con SKU',
  SPARE_PART_WITH_SKU: 'Pieza de repuesto con SKU',
  NON_INVENTORY_SPARE_PART: 'Pieza de repuesto no Inventariada',
  REQUEST_SKU_SPARE_PART: 'Solicitud de pieza de repuesto con SKU',
  UPDATE_SKU: 'Actualización de SKU',
  SERVICE: 'Servicio',
  SERVICE_WITH_MATERIAL: 'Servicio con material',
};

export interface MaterialRequestPdfData {
  materialRequest: MaterialRequest;
  items: MaterialRequestItem[];
  photos: MaterialRequestPhoto[];
  histories: MaterialRequestHistory[];
}

interface PdfmakePrinter {
  createPdfKitDocument(
    docDef: TDocumentDefinitions,
  ): Promise<NodeJS.ReadableStream & NodeJS.EventEmitter & { end(): void }>;
}

@Injectable()
export class MaterialRequestPdfService implements OnModuleInit {
  private readonly logger = new Logger(MaterialRequestPdfService.name);
  private printer: PdfmakePrinter | null = null;

  async onModuleInit(): Promise<void> {
    try {
      this.printer = await this.initPrinter();
      this.logger.log('pdfmake Printer inicializado');
    } catch (err) {
      this.logger.warn('No se pudo pre-inicializar el printer de PDF', err);
    }
  }

  private async getPrinter(): Promise<PdfmakePrinter> {
    if (!this.printer) {
      this.printer = await this.initPrinter();
    }
    return this.printer;
  }

  private async initPrinter(): Promise<PdfmakePrinter> {
    const pdfmakeRoot = dirname(require.resolve('pdfmake/package.json'));
    const fontsDir = join(pdfmakeRoot, 'fonts', 'Roboto');

    const fonts = {
      Roboto: {
        normal: join(fontsDir, 'Roboto-Regular.ttf'),
        bold: join(fontsDir, 'Roboto-Medium.ttf'),
        italics: join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: join(fontsDir, 'Roboto-MediumItalic.ttf'),
      },
    };

    const mod = (await import('pdfmake/js/Printer.js')) as Record<string, any>;
    let Printer = mod?.default ?? mod;
    if (Printer && typeof Printer === 'object' && 'default' in Printer) {
      Printer = Printer.default;
    }
    if (typeof Printer !== 'function') {
      throw new InternalServerErrorException(
        'No se pudo inicializar el generador de PDF',
      );
    }

    const urlResolverMod = (await import('pdfmake/js/URLResolver.js')) as Record<string, any>;
    let URLResolver = urlResolverMod?.default ?? urlResolverMod;
    if (URLResolver && typeof URLResolver === 'object' && 'default' in URLResolver) {
      URLResolver = URLResolver.default;
    }
    if (typeof URLResolver !== 'function') {
      throw new InternalServerErrorException(
        'No se pudo inicializar el resolvedor de URLs para PDF',
      );
    }

    const urlResolver = new URLResolver(fs);
    return new Printer(fonts, undefined, urlResolver);
  }

  async generatePdfBase64(data: MaterialRequestPdfData): Promise<string> {
    const { materialRequest, items, histories } = data;
    const logoDataUrl = await this.readLogoDataUrl();

    // Obtener los valores SC, OC, EM del historial (los más recientes que tengan valor)
    const activeHistory = [...histories].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .find(h => h.purchaseRequest || h.purchaseOrder || h.deliveryMerchandise);

    const content: any[] = [];
    content.push(this.buildHeader(materialRequest, logoDataUrl));
    content.push({ text: ' ', margin: [0, 10] });
    content.push(this.buildRequestInfo(materialRequest, activeHistory));
    content.push({ text: ' ', margin: [0, 10] });
    
    if (items.length > 0) {
      content.push({ text: 'ARTÍCULOS SOLICITADOS', style: 'sectionHeader', margin: [0, 10, 0, 5] });
      content.push(this.buildItemsTable(items));
      content.push({ text: ' ', margin: [0, 10] });
    }

    if (materialRequest.description || materialRequest.justification || materialRequest.comments || materialRequest.suggestedSupplier) {
      content.push(this.buildObservations(materialRequest));
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content,
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
      },
      styles: {
        sectionHeader: { fontSize: 11, bold: true, color: '#333333' }
      } as any
    };

    const printer = await this.getPrinter();
    const doc = await printer.createPdfKitDocument(docDefinition);

    const chunks: Buffer[] = [];
    const pdfPromise = new Promise<string>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      doc.on('error', reject);
      doc.end();
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
    );

    return Promise.race([pdfPromise, timeoutPromise]);
  }

  private buildHeader(mr: MaterialRequest, logoDataUrl: string | null): any {
    return {
      columns: [
        logoDataUrl ? { image: logoDataUrl, width: 80, alignment: 'left' } : { text: '', width: 80 },
        {
          stack: [
            { text: 'SOLICITUD DE MATERIALES', fontSize: 16, bold: true, alignment: 'center' },
            { text: mr.folio, fontSize: 14, bold: true, color: '#444444', alignment: 'center', margin: [0, 5] },
          ],
          width: '*',
        },
        {
          stack: [
            { text: 'Fecha de Solicitud:', fontSize: 8, bold: true, alignment: 'right' },
            { text: mr.createdAt.toLocaleDateString('es-MX'), fontSize: 10, alignment: 'right' },
          ],
          width: 100,
        },
      ],
    };
  }

  private buildRequestInfo(mr: MaterialRequest, history?: MaterialRequestHistory): any {
    const areaMachineText = mr.machines?.length > 0 
      ? mr.machines.map(m => {
          const mName = m.machine?.name || m.customMachineName || '—';
          const mArea = m.machine?.area?.name || m.machine?.subArea?.area?.name || m.customMachineArea || '';
          return mArea ? `${mName} (${mArea})` : mName;
        }).join('\n')
      : 'N/A';

    const labelStyle = { bold: true, fillColor: '#F5F5F5', fontSize: 9 };
    const valueStyle = { fontSize: 9 };

    return {
      table: {
        widths: ['20%', '30%', '20%', '30%'],
        body: [
          [
            { text: 'Solicitante:', ...labelStyle },
            { text: mr.requester?.fullName || '—', ...valueStyle },
            { text: 'Jefe a cargo:', ...labelStyle },
            { text: mr.boss || '—', ...valueStyle },
          ],
          [
            { text: 'Categoría:', ...labelStyle },
            { text: CATEGORY_LABELS[mr.category] || mr.category, ...valueStyle },
            { text: 'Prioridad:', ...labelStyle },
            { text: PRIORITY_LABELS[mr.priority] || mr.priority, ...valueStyle },
          ],
          [
            { text: 'Área / Equipo:', ...labelStyle },
            { text: areaMachineText, colSpan: 3, ...valueStyle },
            {},
            {},
          ],
          [
            { text: 'SC (Soli. Compra):', ...labelStyle },
            { text: history?.purchaseRequest || '—', ...valueStyle },
            { text: 'OC (Ord. Compra):', ...labelStyle },
            { text: history?.purchaseOrder || '—', ...valueStyle },
          ],
          [
            { text: 'EM (Entrega Merc.):', ...labelStyle },
            { text: history?.deliveryMerchandise || '—', ...valueStyle },
            { text: 'Importancia:', ...labelStyle },
            { text: mr.importance ? (IMPORTANCE_LABELS[mr.importance] || mr.importance) : '—', ...valueStyle },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#CCCCCC',
        vLineColor: () => '#CCCCCC',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    };
  }

  private buildItemsTable(items: MaterialRequestItem[]): any {
    return {
      table: {
        headerRows: 1,
        widths: ['*', '10%', '10%', '20%'],
        body: [
          [
            { text: 'Descripción / Artículo', bold: true, fillColor: '#EEEEEE', alignment: 'center' },
            { text: 'Cant.', bold: true, fillColor: '#EEEEEE', alignment: 'center' },
            { text: 'Unidad', bold: true, fillColor: '#EEEEEE', alignment: 'center' },
            { text: 'SKU / No. Parte', bold: true, fillColor: '#EEEEEE', alignment: 'center' },
          ],
          ...items.map(item => [
            { text: item.description || item.material?.description || item.sparePart?.description || '—' },
            { text: item.requestedQuantity || 0, alignment: 'center' },
            { text: item.unitOfMeasure || '—', alignment: 'center' },
            { text: item.sku || item.partNumber || '—' },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#CCCCCC',
        vLineColor: () => '#CCCCCC',
      }
    };
  }

  private buildObservations(mr: MaterialRequest): any {
    const obsRows: any[] = [];
    if (mr.description) obsRows.push([{ text: 'Descripción del Servicio:', bold: true, width: 120 }, { text: mr.description }]);
    if (mr.justification) obsRows.push([{ text: 'Justificación:', bold: true, width: 120 }, { text: mr.justification }]);
    if (mr.comments) obsRows.push([{ text: 'Comentarios adicionales:', bold: true, width: 120 }, { text: mr.comments }]);
    if (mr.suggestedSupplier) obsRows.push([{ text: 'Proveedor sugerido:', bold: true, width: 120 }, { text: mr.suggestedSupplier }]);

    return {
      stack: [
        { text: 'OBSERVACIONES', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: [130, '*'],
            body: obsRows
          },
          layout: 'noBorders'
        }
      ],
    };
  }

  private async readLogoDataUrl(): Promise<string | null> {
    const logoPath = join(process.cwd(), 'assets', 'logo1.png');
    if (!fs.existsSync(logoPath)) return null;
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
}
