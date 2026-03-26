import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  MaterialRequestsRepository,
  MaterialRequestItemsRepository,
  MaterialRequestHistoryRepository,
} from '../../infrastructure/repositories';
import {
  MaterialRequest,
  MaterialRequestItem,
  MaterialRequestMachine,
} from '../../domain/entities';
import {
  CreateMaterialRequestInput,
  UpdateMaterialRequestInput,
  CreateMaterialRequestItemInput,
  SendMaterialRequestEmailInput,
  UpdateMaterialRequestHistoryInput,
} from '../dto';
import { RequestCategory, StatusHistoryMR } from 'src/common';
import { MaterialsService } from 'src/modules/catalogs/materials/application/services';
import { SparePartsService } from 'src/modules/catalogs/spare-parts/application/services';
import { EmailService } from 'src/common/modules/email/application/services/email.service';
import { EmailTemplateService } from 'src/common/modules/email/application/services/email-template.service';
import { MaterialRequestEmailTemplateData } from 'src/common/modules/email/presentation/types';

/** Categories that represent a request for a brand-new SKU (no catalog entry exists yet). */
const SKU_REQUEST_CATEGORIES = new Set<RequestCategory>([
  RequestCategory.REQUEST_SKU_MATERIAL,
  RequestCategory.REQUEST_SKU_SPARE_PART,
]);

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipo',
  PPE: 'Protección personal',
  TOOLS: 'Herramientas',
  MATERIAL_WITH_SKU: 'Material con SKU',
  NON_INVENTORY_MATERIAL: 'Material no inventariado',
  REQUEST_SKU_MATERIAL: 'Solicitud de material con SKU',
  SPARE_PART_WITH_SKU: 'Pieza de repuesto con SKU',
  NON_INVENTORY_SPARE_PART: 'Pieza de repuesto no inventariada',
  REQUEST_SKU_SPARE_PART: 'Solicitud de pieza de repuesto con SKU',
  UPDATE_SKU: 'Actualización de SKU',
  SERVICE: 'Servicio',
  SERVICE_WITH_MATERIAL: 'Servicio con material',
};

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgente',
  SCHEDULED: 'Programada',
};

const IMPORTANCE_LABELS: Record<string, string> = {
  VERY_IMPORTANT: 'Muy importante',
  IMPORTANT: 'Importante',
  UNIMPORTANT: 'Poco importante',
};

/** Map each status to its progress percentage (email sent = 20% base + 10% per status). */
const STATUS_PROGRESS_MAP: Record<StatusHistoryMR, number> = {
  [StatusHistoryMR.PENDING_PURCHASE_REQUEST]: 30,
  [StatusHistoryMR.PENDING_QUOTATION]: 40,
  [StatusHistoryMR.PENDING_APPROVAL_QUOTATION]: 50,
  [StatusHistoryMR.PENDING_SUPPLIER_REGISTRATION]: 60,
  [StatusHistoryMR.PENDING_PURCHASE_ORDER]: 70,
  [StatusHistoryMR.PENDING_PAYMENT]: 80,
  [StatusHistoryMR.PENDING_DELIVERY]: 90,
  [StatusHistoryMR.DELIVERED]: 100,
};

/** Determine the item type label for the summary table. */
function resolveItemType(item: MaterialRequestItem): string {
  if (item.materialId) return 'Material';
  if (item.sparePartId) return 'Refacción';
  return 'Otro';
}

@Injectable()
export class MaterialRequestsService {
  private readonly logger = new Logger(MaterialRequestsService.name);

  constructor(
    private readonly materialRequestsRepository: MaterialRequestsRepository,
    private readonly materialRequestItemsRepository: MaterialRequestItemsRepository,
    private readonly materialRequestHistoryRepository: MaterialRequestHistoryRepository,
    private readonly materialsService: MaterialsService,
    private readonly sparePartsService: SparePartsService,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private isSKURequest(category: RequestCategory): boolean {
    return SKU_REQUEST_CATEGORIES.has(category);
  }

  /**
   * Validates a single item against the parent request's category.
   *
   * Catalog item  → verifies the referenced Material/SparePart exists.
   * SKU request   → enforces brand, partNumber, proposedMaxStock, proposedMinStock.
   */
  private async validateItem(
    item: CreateMaterialRequestItemInput,
    category: RequestCategory,
  ): Promise<void> {
    const hasSelectedCatalogItem = !!(item.materialId || item.sparePartId);

    if (hasSelectedCatalogItem) {
      if (item.materialId) {
        await this.materialsService.findByIdOrFail(item.materialId);
      }
      if (item.sparePartId) {
        await this.sparePartsService.findByIdOrFail(item.sparePartId);
      }
      return;
    }

    if (this.isSKURequest(category)) {
      const errors: string[] = [];

      if (!item.brand?.trim()) {
        errors.push(
          'La marca (brand) es requerida para solicitudes de creación de SKU',
        );
      }
      if (!item.partNumber?.trim()) {
        errors.push(
          'El número de parte (partNumber) es requerido para solicitudes de creación de SKU',
        );
      }
      if (item.proposedMaxStock == null) {
        errors.push(
          'El stock máximo propuesto (proposedMaxStock) es requerido para solicitudes de creación de SKU',
        );
      }
      if (item.proposedMinStock == null) {
        errors.push(
          'El stock mínimo propuesto (proposedMinStock) es requerido para solicitudes de creación de SKU',
        );
      }
      if (item.proposedMinStock != null && item.proposedMinStock < 0) {
        errors.push('El stock mínimo propuesto debe ser mayor o igual a 0');
      }
      if (
        item.proposedMaxStock != null &&
        item.proposedMinStock != null &&
        item.proposedMaxStock <= item.proposedMinStock
      ) {
        errors.push(
          'El stock máximo propuesto debe ser mayor al stock mínimo propuesto',
        );
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    }
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<MaterialRequest[]> {
    return this.materialRequestsRepository.findAll();
  }

  async findAllWithDeleted(): Promise<MaterialRequest[]> {
    return this.materialRequestsRepository.findAllWithDeleted();
  }

  async findAllActive(): Promise<MaterialRequest[]> {
    return this.materialRequestsRepository.findAllActive();
  }

  async findById(id: string): Promise<MaterialRequest | null> {
    return this.materialRequestsRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<MaterialRequest> {
    const materialRequest = await this.materialRequestsRepository.findById(id);
    if (!materialRequest) {
      throw new NotFoundException(
        `Solicitud de material con ID ${id} no encontrada`,
      );
    }
    return materialRequest;
  }

  async findByFolio(folio: string): Promise<MaterialRequest | null> {
    return this.materialRequestsRepository.findByFolio(folio);
  }

  async findByMachineId(machineId: string): Promise<MaterialRequest[]> {
    return this.materialRequestsRepository.findByMachineId(machineId);
  }

  // ─── Mutations ───────────────────────────────────────────────────────────────

  async create(input: CreateMaterialRequestInput): Promise<MaterialRequest> {
    for (const item of input.items ?? []) {
      await this.validateItem(item, input.category);
    }
    const { machineIds, ...rest } = input;
    const machines = machineIds.map(
      (machineId) => ({ machineId }) as unknown as { machineId: string },
    );
    return this.materialRequestsRepository.create({
      ...rest,
      machines,
    } as Partial<MaterialRequest>);
  }

  async update(
    id: string,
    input: UpdateMaterialRequestInput,
  ): Promise<MaterialRequest | null> {
    const existing = await this.findByIdOrFail(id);
    const category = input.category ?? existing.category;
    for (const item of input.items ?? []) {
      await this.validateItem(item, category);
    }
    const { machineIds, ...rest } = input;
    const data: Partial<MaterialRequest> = {
      ...rest,
    } as Partial<MaterialRequest>;
    if (machineIds) {
      data.machines = machineIds.map((machineId) => ({
        machineId,
      })) as unknown as MaterialRequestMachine[];
    }
    return this.materialRequestsRepository.update(id, data);
  }

  async addMaterial(
    materialRequestId: string,
    input: CreateMaterialRequestItemInput,
  ): Promise<MaterialRequestItem> {
    const request = await this.findByIdOrFail(materialRequestId);
    await this.validateItem(input, request.category);
    return this.materialRequestItemsRepository.create({
      ...input,
      materialRequestId,
    });
  }

  async removeMaterial(materialRequestItemId: string): Promise<boolean> {
    await this.materialRequestItemsRepository.delete(materialRequestItemId);
    return true;
  }

  async deactivate(id: string): Promise<boolean> {
    await this.findByIdOrFail(id);
    await this.materialRequestsRepository.softDelete(id);
    return true;
  }

  // ─── Email ──────────────────────────────────────────────────────────────────

  async sendEmail(input: SendMaterialRequestEmailInput): Promise<boolean> {
    const request = await this.findByIdOrFail(input.materialRequestId);

    if (request.emailSentAt) {
      throw new BadRequestException(
        'El correo de esta solicitud ya fue enviado',
      );
    }

    const machineEntities = (request.machines ?? []).map((mrm) => mrm.machine);
    const areaNames = new Set<string>();
    for (const m of machineEntities) {
      const name = m?.area?.name ?? m?.subArea?.area?.name;
      if (name) areaNames.add(name);
    }
    const derivedAreaName =
      areaNames.size === 1
        ? [...areaNames][0]
        : areaNames.size > 1
          ? 'Diversas áreas'
          : undefined;

    const formatDate = (d: Date): string => {
      const day = String(d.getDate()).padStart(2, '0');
      const months = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} de ${month} de ${year}, ${hours}:${mins}`;
    };

    const templateData: MaterialRequestEmailTemplateData = {
      folio: request.folio,
      createdAt: formatDate(request.createdAt),
      requesterName: request.requester.fullName,
      requesterEmployeeNumber: request.requester.employeeNumber,
      boss: request.boss,
      category: CATEGORY_LABELS[request.category] ?? request.category,
      priority: PRIORITY_LABELS[request.priority] ?? request.priority,
      importance: IMPORTANCE_LABELS[request.importance] ?? request.importance,
      derivedAreaName,
      machines: machineEntities.map((m) => ({
        name: m?.name ?? '',
        brand: m?.brand,
        model: m?.model,
        manufacturer: m?.manufacturer,
        areaName: m?.area?.name ?? m?.subArea?.area?.name,
        subAreaName: m?.subArea?.name,
      })),
      description: request.description,
      justification: request.justification,
      comments: request.comments,
      suggestedSupplier: request.suggestedSupplier,
      customMessage: input.message,
      items: (request.items ?? []).map((item, i) => ({
        index: i + 1,
        type: resolveItemType(item),
        description: item.description ?? item.customName,
        customName: item.customName,
        sku: item.sku,
        partNumber: item.partNumber,
        brand: item.brand,
        model: item.model,
        unitOfMeasure: item.unitOfMeasure,
        requestedQuantity: item.requestedQuantity,
        proposedMaxStock: item.proposedMaxStock,
        proposedMinStock: item.proposedMinStock,
        isGenericAllowed: item.isGenericAllowed,
      })),
    };

    const html =
      this.emailTemplateService.renderMaterialRequestTemplate(templateData);

    await this.emailService.send({
      to: input.to,
      cc: input.cc,
      subject: `Solicitud de Material ${request.folio}`,
      html,
    });

    await this.materialRequestsRepository.update(request.id, {
      emailSentAt: new Date(),
    });

    // Auto-create history with initial status after email is sent
    await this.materialRequestHistoryRepository.upsert(request.id, {
      status: StatusHistoryMR.PENDING_PURCHASE_REQUEST,
      progressPercentage:
        STATUS_PROGRESS_MAP[StatusHistoryMR.PENDING_PURCHASE_REQUEST],
    });

    this.logger.log(
      `Email sent for material request ${request.folio} to ${input.to.join(', ')}`,
    );

    return true;
  }

  // ─── History ─────────────────────────────────────────────────────────────────

  async updateHistory(
    input: UpdateMaterialRequestHistoryInput,
  ): Promise<MaterialRequest> {
    const mr = await this.findByIdOrFail(input.materialRequestId);

    if (!mr.emailSentAt) {
      throw new BadRequestException(
        'No se puede actualizar el historial: el correo de la solicitud aún no ha sido enviado',
      );
    }

    // Fetch existing history to merge with input for chain validation
    const existing =
      await this.materialRequestHistoryRepository.findByMaterialRequestId(
        input.materialRequestId,
      );

    const effectiveSC = input.purchaseRequest || existing?.purchaseRequest;
    const effectiveOC = input.purchaseOrder || existing?.purchaseOrder;
    const effectiveEM =
      input.deliveryMerchandise || existing?.deliveryMerchandise;

    // Chain validation: OC depends on SC, EM depends on OC
    const STATUSES_REQUIRING_SC = new Set([
      StatusHistoryMR.PENDING_PURCHASE_ORDER,
      StatusHistoryMR.PENDING_PAYMENT,
      StatusHistoryMR.PENDING_DELIVERY,
      StatusHistoryMR.DELIVERED,
    ]);

    const STATUSES_REQUIRING_OC = new Set([
      StatusHistoryMR.PENDING_DELIVERY,
      StatusHistoryMR.DELIVERED,
    ]);

    if (STATUSES_REQUIRING_SC.has(input.status) && !effectiveSC) {
      throw new BadRequestException(
        'No se puede cambiar a este estatus sin una Solicitud de Compra (S.C.)',
      );
    }

    if (STATUSES_REQUIRING_OC.has(input.status) && !effectiveOC) {
      throw new BadRequestException(
        'No se puede cambiar a este estatus sin una Orden de Compra (O.C.)',
      );
    }

    if (input.status === StatusHistoryMR.DELIVERED && !effectiveEM) {
      throw new BadRequestException(
        'No se puede marcar como entregado sin una Entrega de Mercancía (E.M.)',
      );
    }

    const progressPercentage = STATUS_PROGRESS_MAP[input.status];
    const deliveryDate =
      input.status === StatusHistoryMR.DELIVERED ? new Date() : undefined;

    await this.materialRequestHistoryRepository.upsert(
      input.materialRequestId,
      {
        status: input.status,
        purchaseRequest: input.purchaseRequest,
        purchaseOrder: input.purchaseOrder,
        deliveryMerchandise: input.deliveryMerchandise,
        supplier: input.supplier,
        progressPercentage,
        ...(deliveryDate !== undefined && { deliveryDate }),
      },
    );

    return this.findByIdOrFail(input.materialRequestId);
  }
}
