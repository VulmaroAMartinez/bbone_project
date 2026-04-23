import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { join, dirname, basename, sep } from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { WorkOrderTechnician } from '../../domain/entities/work-order-technician.entity';
import { WorkOrderSignature } from '../../domain/entities/work-order-signature.entity';
import { WorkOrderPhoto } from '../../domain/entities/work-order-photo.entity';
import { WorkOrderSparePart } from '../../domain/entities/work-order-spare-part.entity';
import { WorkOrderMaterial } from '../../domain/entities/work-order-material.entity';
import { PhotoType, StopType } from 'src/common';

// ── Label maps ──────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const WORK_TYPE_LABELS: Record<string, string> = {
  PAINTING: 'Pintura',
  PNEUMATIC: 'Neumática',
  ELECTRONIC: 'Electrónico',
  ELECTRICAL: 'Eléctrico',
  BUILDING: 'Edificio',
  METROLOGY: 'Metrología',
  AUTOMATION: 'Automatización',
  MECHANICAL: 'Mecánico',
  HYDRAULIC: 'Hidráulico',
  ELECTRICAL_CONTROL: 'Control Eléctrico',
  OTHER: 'Otro',
};

const STOP_TYPE_LABELS: Record<string, string> = {
  BREAKDOWN: 'Avería',
  OTHER: 'Otro',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  REQUESTER: 'Solicitante',
  BOSS: 'Jefe',
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface WorkOrderPdfData {
  workOrder: WorkOrder;
  technicians: WorkOrderTechnician[];
  signatures: WorkOrderSignature[];
  photos: WorkOrderPhoto[];
  spareParts: WorkOrderSparePart[];
  materials: WorkOrderMaterial[];
}

interface PdfmakePrinter {
  createPdfKitDocument(
    docDef: TDocumentDefinitions,
  ): Promise<NodeJS.ReadableStream & NodeJS.EventEmitter & { end(): void }>;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class WorkOrderPdfService implements OnModuleInit {
  private readonly logger = new Logger(WorkOrderPdfService.name);
  private printer: PdfmakePrinter | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    try {
      this.printer = await this.initPrinter();
      this.logger.log('pdfmake Printer inicializado y cacheado');
    } catch (err) {
      this.logger.warn(
        'No se pudo pre-inicializar el printer de PDF; se inicializará bajo demanda',
        err,
      );
    }
  }

  private async getPrinter(): Promise<PdfmakePrinter> {
    if (!this.printer) {
      this.printer = await this.initPrinter();
    }
    return this.printer;
  }

  // ── pdfmake printer init (same pattern as PdfGeneratorService) ──

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

    const mod = (await import('pdfmake/js/Printer.js')) as Record<
      string,
      unknown
    >;
    let Printer = (mod?.default ?? mod) as
      | { default?: unknown }
      | (new (...args: unknown[]) => unknown);
    if (Printer && typeof Printer === 'object' && 'default' in Printer) {
      Printer = Printer.default as new (...args: unknown[]) => unknown;
    }
    if (typeof Printer !== 'function') {
      throw new InternalServerErrorException(
        'No se pudo inicializar el generador de PDF',
      );
    }

    const urlResolverMod =
      (await import('pdfmake/js/URLResolver.js')) as Record<string, unknown>;
    let URLResolver = (urlResolverMod?.default ?? urlResolverMod) as
      | { default?: unknown }
      | (new (...args: unknown[]) => unknown);
    if (
      URLResolver &&
      typeof URLResolver === 'object' &&
      'default' in URLResolver
    ) {
      URLResolver = URLResolver.default as new (...args: unknown[]) => unknown;
    }
    if (typeof URLResolver !== 'function') {
      throw new InternalServerErrorException(
        'No se pudo inicializar el resolvedor de URLs para PDF',
      );
    }

    const urlResolver = new (URLResolver as new (
      ...args: unknown[]
    ) => unknown)(fs);
    const instance = new (Printer as new (...args: unknown[]) => unknown)(
      fonts,
      undefined,
      urlResolver,
    );
    return instance as PdfmakePrinter;
  }

  // ── Async image helpers ────────────────────────────────────────────────────

  private async readImageDataUrl(
    fullPath: string,
    mime: string,
  ): Promise<string | null> {
    try {
      const buf = await fsPromises.readFile(fullPath);
      return `data:${mime};base64,${buf.toString('base64')}`;
    } catch {
      this.logger.warn(`No se pudo leer imagen: ${fullPath}`);
      return null;
    }
  }

  private readLogoDataUrl(): Promise<string | null> {
    const logoPath = join(process.cwd(), 'assets', 'logo1.png');
    return this.readImageDataUrl(logoPath, 'image/png');
  }

  private readUploadedImageDataUrl(
    filename: string,
    mime?: string,
  ): Promise<string | null> {
    if (!filename) return Promise.resolve(null);
    const safeName = basename(filename);
    const uploadsDir = join(process.cwd(), 'uploads');
    const fullPath = join(uploadsDir, safeName);
    if (!fullPath.startsWith(uploadsDir + sep)) return Promise.resolve(null);
    const ext = safeName.split('.').pop()?.toLowerCase() ?? '';
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const resolvedMime = mime ?? mimeMap[ext] ?? 'image/png';
    return this.readImageDataUrl(fullPath, resolvedMime);
  }

  // ── Date helpers ─────────────────────────────────────────────────────────

  private formatDate(date?: Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatDateTime(date?: Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Section builders ──────────────────────────────────────────────────────

  private buildHeader(wo: WorkOrder, logoDataUrl: string | null): any {
    const leftCol: any = logoDataUrl
      ? { image: logoDataUrl, width: 70, alignment: 'left' }
      : { text: '', width: 70 };

    const centerCol: any = {
      stack: [
        {
          text: 'BUMBLE BEE MEXICO S DE RL DE CV',
          bold: true,
          fontSize: 13,
          alignment: 'center',
        },
        {
          text: 'MANTENIMIENTO',
          fontSize: 10,
          alignment: 'center',
          margin: [0, 2, 0, 0],
        },
      ],
      alignment: 'center',
    };

    const rightCol: any = {
      stack: [
        {
          text: `Folio: ${wo.folio}`,
          bold: true,
          fontSize: 10,
          alignment: 'right',
        },
        {
          text: `Fecha: ${this.formatDate(wo.createdAt)}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 2, 0, 0],
        },
      ],
    };

    return {
      stack: [
        {
          table: {
            widths: [75, '*', 110],
            body: [[leftCol, centerCol, rightCol]],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 4,
              x2: 535,
              y2: 4,
              lineWidth: 1,
              lineColor: '#1F4E79',
            },
          ],
          margin: [0, 4, 0, 8],
        },
      ],
    };
  }

  private buildDatosOrden(
    wo: WorkOrder,
    technicians: WorkOrderTechnician[],
  ): any {
    const requesterName = wo.requester
      ? `${wo.requester.firstName} ${wo.requester.lastName}`
      : 'N/A';

    const areaText = wo.area
      ? wo.area.name + (wo.subArea ? ` / ${wo.subArea.name}` : '')
      : 'N/A';

    const machineText = wo.machine
      ? `${wo.machine.code ?? ''} - ${wo.machine.name ?? ''}`.trim()
      : 'N/A';

    const techLines = technicians.map((t) => {
      const name = t.technician
        ? `${t.technician.firstName} ${t.technician.lastName}`
        : 'N/A';
      const role = t.isLead ? 'Técnico Líder' : 'Técnico Auxiliar';
      return `${name} (${role})`;
    });
    const techText =
      techLines.length > 0 ? techLines.join('\n') : 'Sin asignar';

    const priorityText = wo.priority
      ? (PRIORITY_LABELS[String(wo.priority)] ?? String(wo.priority))
      : 'N/A';

    const workTypeText = wo.workType
      ? (WORK_TYPE_LABELS[String(wo.workType)] ?? String(wo.workType))
      : 'N/A';

    const stopTypeText = wo.stopType
      ? (STOP_TYPE_LABELS[String(wo.stopType)] ?? String(wo.stopType))
      : 'N/A';

    const L = { bold: true, fontSize: 9, fillColor: '#F0F4F8' };
    const V = { fontSize: 9 };

    const row = (label: string, value: string): any[] => [
      { text: label, ...L },
      { text: value, ...V },
    ];

    return {
      stack: [
        this.sectionTitle('DATOS DE LA ORDEN'),
        {
          table: {
            widths: [130, '*'],
            body: [
              row('Solicitante:', requesterName),
              row('Área / SubÁrea:', areaText),
              row('Equipo/Estructura:', machineText),
              row('Tipo de paro:', stopTypeText),
              row('Prioridad:', priorityText),
              row('Tipo de trabajo:', workTypeText),
              row('Responsable(s):', techText),
              row('Descripción:', wo.description ?? 'N/A'),
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#CCCCCC',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },
      ],
    };
  }

  private buildRegistroFotografico(
    beforePhoto: WorkOrderPhoto | undefined,
    afterPhoto: WorkOrderPhoto | undefined,
    beforeDataUrl: string | null,
    afterDataUrl: string | null,
  ): object | null {
    if (!beforePhoto && !afterPhoto) return null;

    const buildPhotoCol = (dataUrl: string | null, label: string): any => ({
      stack: [
        {
          text: label,
          bold: true,
          fontSize: 9,
          alignment: 'center',
          margin: [0, 0, 0, 4],
        },
        dataUrl
          ? { image: dataUrl, fit: [230, 175], alignment: 'center' }
          : {
              text: 'Sin fotografía',
              fontSize: 9,
              italics: true,
              color: '#888888',
              alignment: 'center',
              margin: [0, 40, 0, 40],
            },
      ],
      width: '*',
    });

    return {
      stack: [
        this.sectionTitle('REGISTRO FOTOGRÁFICO', 12),
        {
          columns: [
            buildPhotoCol(beforeDataUrl, 'Foto antes de la actividad'),
            buildPhotoCol(afterDataUrl, 'Foto después de la actividad'),
          ],
          columnGap: 10,
        },
      ],
    };
  }

  private buildSeccionEjecucion(
    wo: WorkOrder,
    spareParts: WorkOrderSparePart[],
    materials: WorkOrderMaterial[],
  ): any {
    const rows: any[] = [];

    const addField = (label: string, value: string): void => {
      rows.push({
        columns: [
          {
            text: label,
            bold: true,
            fontSize: 9,
            width: 160,
            fillColor: '#F0F4F8',
          },
          { text: value, fontSize: 9, width: '*' },
        ],
        columnGap: 0,
        margin: [0, 0, 0, 1],
      });
    };

    addField('Fecha/Hora Inicio:', this.formatDateTime(wo.startDate));
    addField('Fecha/Hora Fin:', this.formatDateTime(wo.endDate));
    addField('Tiempo funcional:', `${wo.functionalTimeMinutes ?? 0} min`);

    if (wo.downtimeMinutes && wo.downtimeMinutes > 0) {
      addField('Tiempo muerto:', `${wo.downtimeMinutes} min`);
    }

    if (wo.stopType === StopType.BREAKDOWN) {
      if (wo.breakdownDescription) {
        addField('Descripción de avería:', wo.breakdownDescription);
      }
      if (wo.cause) {
        addField('Causa:', wo.cause);
      }
      if (wo.actionTaken) {
        addField('Acción correctiva:', wo.actionTaken);
      }
    } else {
      if (wo.observations) {
        addField('Observaciones:', wo.observations);
      }
    }

    if (wo.toolsUsed) {
      addField('Herramientas usadas:', wo.toolsUsed);
    }

    // Refacciones (solo BREAKDOWN)
    if (wo.stopType === StopType.BREAKDOWN && spareParts.length > 0) {
      rows.push({
        text: 'Refacciones usadas:',
        bold: true,
        fontSize: 9,
        margin: [0, 6, 0, 3],
      });
      rows.push(
        this.buildItemTable(
          ['No. Parte', 'Marca', 'Cantidad', 'Unidad'],
          ['*', 80, 60, 60],
          spareParts.map((sp) => [
            sp.sparePart?.partNumber ?? 'N/A',
            sp.sparePart?.brand ?? '-',
            String(sp.quantity),
            sp.sparePart?.unitOfMeasure ?? '-',
          ]),
        ),
      );
    }

    // customSparePart (solo BREAKDOWN)
    if (wo.stopType === StopType.BREAKDOWN && wo.customSparePart) {
      rows.push({
        text: `Refacción (otro): ${wo.customSparePart}`,
        fontSize: 9,
        margin: [0, 2, 0, 2],
      });
    }

    // Materiales
    if (materials.length > 0) {
      rows.push({
        text: 'Materiales usados:',
        bold: true,
        fontSize: 9,
        margin: [0, 6, 0, 3],
      });
      rows.push(
        this.buildItemTable(
          ['Descripción', 'Marca', 'Cantidad', 'Unidad'],
          ['*', 80, 60, 60],
          materials.map((m) => [
            m.material?.description ?? 'N/A',
            m.material?.brand ?? '-',
            String(m.quantity),
            m.material?.unitOfMeasure ?? '-',
          ]),
        ),
      );
    }

    if (wo.customMaterial) {
      rows.push({
        text: `Material (otro): ${wo.customMaterial}`,
        fontSize: 9,
        margin: [0, 2, 0, 2],
      });
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stack: [this.sectionTitle('EJECUCIÓN', 12), ...rows],
    };
  }

  private buildItemTable(
    headers: string[],
    widths: (string | number)[],
    dataRows: string[][],
  ): any {
    return {
      table: {
        headerRows: 1,
        widths,
        body: [
          headers.map((h) => ({
            text: h,
            bold: true,
            fontSize: 8,
            fillColor: '#1F4E79',
            color: '#FFFFFF',
          })),
          ...dataRows.map((r) =>
            r.map((cell) => ({ text: cell, fontSize: 8 })),
          ),
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#CCCCCC',
        vLineColor: () => '#CCCCCC',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, 0, 0, 4],
    };
  }

  private buildSeccionFirmas(
    workOrder: WorkOrder,
    technicians: WorkOrderTechnician[],
    signatures: WorkOrderSignature[],
    sigDataUrlBySignatureId: Map<string, string | null>,
  ): any {
    const sigFit: [number, number] = [140, 55];
    const leadTechnicianId =
      technicians.find((techRelation) => techRelation.isLead)?.technicianId ??
      null;
    const requesterSignature =
      signatures.find(
        (signature) => signature.signerId === workOrder.requesterId,
      ) ?? null;
    const technicianSignature = leadTechnicianId
      ? (signatures.find(
          (signature) => signature.signerId === leadTechnicianId,
        ) ?? null)
      : null;
    const adminSignature =
      signatures.find((signature) => {
        if (signature.signerId === workOrder.requesterId) return false;
        if (leadTechnicianId && signature.signerId === leadTechnicianId)
          return false;
        return signature.signer?.isAdmin?.() ?? false;
      }) ?? null;
    const requesterIsAdmin = workOrder.requester?.isAdmin?.() ?? false;
    const slots = requesterIsAdmin
      ? [
          {
            title: 'Solicitante / Administrador',
            signature: requesterSignature,
          },
          {
            title: 'Técnico',
            signature: technicianSignature,
          },
        ]
      : [
          { title: 'Solicitante', signature: requesterSignature },
          { title: 'Técnico', signature: technicianSignature },
          { title: 'Administrador', signature: adminSignature },
        ];

    const columns: any[] = [];

    for (const slot of slots) {
      const sig = slot.signature;

      if (sig) {
        const dataUrl = sigDataUrlBySignatureId.get(sig.id) ?? null;
        const signerName = sig.signer
          ? `${sig.signer.firstName} ${sig.signer.lastName}`
          : 'N/A';

        const activeRoles =
          sig.signer?.userRoles
            ?.filter((ur) => ur.isActive !== false)
            ?.map((ur) => {
              const name = ur.role?.name;
              return name ? (ROLE_LABELS[name] ?? name) : undefined;
            })
            ?.filter(Boolean)
            ?.join(', ') ?? '';

        columns.push({
          stack: [
            dataUrl
              ? { image: dataUrl, fit: sigFit, alignment: 'center' }
              : {
                  text: 'Firma no disponible',
                  fontSize: 8,
                  italics: true,
                  alignment: 'center',
                  color: '#888888',
                  margin: [0, 18, 0, 18],
                },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 5,
                  y1: 2,
                  x2: 155,
                  y2: 2,
                  lineWidth: 0.5,
                  lineColor: '#333333',
                },
              ],
              margin: [0, 2, 0, 2],
            },
            { text: signerName, fontSize: 8, bold: true, alignment: 'center' },
            {
              text: slot.title,
              fontSize: 7,
              alignment: 'center',
              color: '#555555',
              margin: [0, 2, 0, 0],
            },
            {
              text: activeRoles,
              fontSize: 7,
              alignment: 'center',
              color: '#555555',
            },
          ],
          width: '*',
        });
      } else {
        columns.push({
          stack: [
            { text: ' ', margin: [0, 55, 0, 0] },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 5,
                  y1: 2,
                  x2: 155,
                  y2: 2,
                  lineWidth: 0.5,
                  lineColor: '#333333',
                },
              ],
              margin: [0, 2, 0, 2],
            },
            {
              text: 'Firma pendiente',
              fontSize: 8,
              italics: true,
              alignment: 'center',
              color: '#888888',
            },
            {
              text: slot.title,
              fontSize: 7,
              alignment: 'center',
              color: '#555555',
              margin: [0, 2, 0, 0],
            },
          ],
          width: '*',
        });
      }
    }

    return {
      stack: [this.sectionTitle('FIRMAS', 12), { columns, columnGap: 10 }],
    };
  }

  private sectionTitle(text: string, topMargin = 10): any {
    return {
      text,
      bold: true,
      fontSize: 11,
      color: '#1F4E79',
      margin: [0, topMargin, 0, 6],
    };
  }

  // ── Main generation ───────────────────────────────────────────────────────

  async generatePdfBase64(data: WorkOrderPdfData): Promise<string> {
    const startedAt = Date.now();
    const {
      workOrder,
      technicians,
      signatures,
      photos,
      spareParts,
      materials,
    } = data;

    try {
      const beforePhoto = photos.find((p) => p.photoType === PhotoType.BEFORE);
      const afterPhoto = photos.find((p) => p.photoType === PhotoType.AFTER);

      // Pre-load all images in parallel (non-blocking async I/O)
      const [logoDataUrl, beforeDataUrl, afterDataUrl, ...sigDataUrls] =
        await Promise.all([
          this.readLogoDataUrl(),
          beforePhoto
            ? this.readUploadedImageDataUrl(
                beforePhoto.filePath,
                beforePhoto.mimeType,
              )
            : Promise.resolve(null),
          afterPhoto
            ? this.readUploadedImageDataUrl(
                afterPhoto.filePath,
                afterPhoto.mimeType,
              )
            : Promise.resolve(null),
          ...signatures.map((s) =>
            this.readUploadedImageDataUrl(s.signatureImagePath),
          ),
        ]);
      const sigDataUrlBySignatureId = new Map<string, string | null>(
        signatures.map((signature, index) => [
          signature.id,
          sigDataUrls[index] ?? null,
        ]),
      );

      const content: any[] = [];

      content.push(this.buildHeader(workOrder, logoDataUrl));
      content.push(this.buildDatosOrden(workOrder, technicians));

      const photoSection = this.buildRegistroFotografico(
        beforePhoto,
        afterPhoto,
        beforeDataUrl,
        afterDataUrl,
      );
      if (photoSection) {
        content.push(photoSection);
      }

      content.push(
        this.buildSeccionEjecucion(workOrder, spareParts, materials),
      );
      content.push(
        this.buildSeccionFirmas(
          workOrder,
          technicians,
          signatures,
          sigDataUrlBySignatureId,
        ),
      );

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [30, 30, 30, 30],
        content,
        defaultStyle: {
          font: 'Roboto',
          fontSize: 9,
        },
      };

      const printer = await this.getPrinter();
      const doc = await printer.createPdfKitDocument(docDefinition);

      const chunks: Buffer[] = [];
      const pdfPromise = new Promise<string>((resolve, reject) => {
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
        doc.on('error', reject);
        doc.end();
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Tiempo de espera agotado al generar el PDF')),
          30_000,
        ),
      );
      const base64 = await Promise.race([pdfPromise, timeoutPromise]);

      this.logger.log('PDF de OT generado', {
        folio: workOrder.folio,
        elapsedMs: Date.now() - startedAt,
      });

      return base64;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error generando PDF de OT', {
        folio: workOrder.folio,
        err: message,
        elapsedMs: Date.now() - startedAt,
      });
      throw new InternalServerErrorException(
        'Error al generar el PDF de la orden de trabajo',
      );
    }
  }
}
