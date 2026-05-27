import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { existsSync, promises as fsPromises } from 'fs';
import { basename, join } from 'path';
import {
  MaterialRequestsRepository,
  MaterialRequestItemsRepository,
  MaterialRequestHistoryRepository,
  MaterialRequestPhotosRepository,
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
  CreateMaterialRequestPhotoInput,
  MaterialRequestHistoryExportFiltersInput,
} from '../dto';
import { RequestCategory, StatusHistoryMR } from 'src/common';
import { MaterialRequestPhoto } from '../../domain/entities';
import { User } from 'src/modules/users/domain/entities';
import { MaterialsService } from 'src/modules/catalogs/materials/application/services';
import { SparePartsService } from 'src/modules/catalogs/spare-parts/application/services';
import { EmailService } from 'src/common/modules/email/application/services/email.service';
import { EmailTemplateService } from 'src/common/modules/email/application/services/email-template.service';
import { MaterialRequestEmailTemplateData } from 'src/common/modules/email/presentation/types';
import { MaterialRequestPdfService } from './material-request-pdf.service';
import * as ExcelJS from 'exceljs';

const ALLOWED_PHOTO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_PHOTOS_PER_REQUEST = 5;

/** Categories that represent a request for a brand-new SKU (no catalog entry exists yet). */
const SKU_REQUEST_CATEGORIES = new Set<RequestCategory>([
  RequestCategory.REQUEST_SKU_MATERIAL,
  RequestCategory.REQUEST_SKU_SPARE_PART,
]);

/** When "otro" is selected, auto-create a Material catalog entry. */
const CATALOG_MATERIAL_CATEGORIES = new Set<RequestCategory>([
  RequestCategory.MATERIAL_WITH_SKU,
  RequestCategory.REQUEST_SKU_MATERIAL,
  RequestCategory.UPDATE_SKU,
  RequestCategory.SERVICE_WITH_MATERIAL,
  RequestCategory.EQUIPMENT,
  RequestCategory.PPE,
  RequestCategory.TOOLS,
]);

/** When "otro" is selected, auto-create a SparePart catalog entry. */
const CATALOG_SPARE_PART_CATEGORIES = new Set<RequestCategory>([
  RequestCategory.SPARE_PART_WITH_SKU,
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
  CRITICAL: 'Crítico',
};

/** Alineado con `STATUS_LABELS` del front (material-request.constants). */
const STATUS_LABELS: Record<string, string> = {
  PENDING_PURCHASE_REQUEST: 'Pendiente S.C.',
  PENDING_QUOTATION: 'Pendiente cotización',
  PENDING_APPROVAL_QUOTATION: 'Aprobación cotización',
  PENDING_SUPPLIER_REGISTRATION: 'Alta proveedor',
  PENDING_PURCHASE_ORDER: 'Pendiente O.C.',
  PENDING_PAYMENT: 'Pendiente pago',
  PENDING_DELIVERY: 'Pendiente entrega',
  DELIVERED: 'Entregado',
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

/** Basename seguro para borrar archivos en `uploads/` (mismo criterio que findings). */
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

function exportFormatDateTime(d: Date | string | null | undefined): string {
  if (d == null) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function exportGetLatestHistory<T extends { createdAt?: Date | null }>(
  histories: T[] | null | undefined,
): T | undefined {
  if (!histories?.length) return undefined;
  return [...histories].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  })[0];
}

type ExportMachineLike = {
  customMachineArea?: string | null;
  customMachineName?: string | null;
  customMachineModel?: string | null;
  customMachineManufacturer?: string | null;
  machine?: {
    name?: string | null;
    brand?: string | null;
    model?: string | null;
    area?: { name: string } | null;
    subArea?: { area?: { name: string } | null } | null;
  } | null;
};

function exportDeriveArea(
  machines: ExportMachineLike[] | null | undefined,
): string {
  const names = new Set<string>();
  for (const mrm of machines ?? []) {
    const name =
      mrm.machine?.area?.name ??
      mrm.machine?.subArea?.area?.name ??
      mrm.customMachineArea ??
      undefined;
    if (name) names.add(name);
  }
  if (names.size === 1) return [...names][0];
  if (names.size > 1) return 'Diversas áreas';
  return '';
}

function exportMachinesSummary(
  machines: ExportMachineLike[] | null | undefined,
): string {
  const parts: string[] = [];
  for (const mrm of machines ?? []) {
    const displayName = mrm.machine?.name ?? mrm.customMachineName ?? '';
    const brand = mrm.machine?.brand ?? mrm.customMachineManufacturer;
    const model = mrm.machine?.model ?? mrm.customMachineModel;
    const tail = [brand, model].filter(Boolean).join(' · ');
    const line = displayName + (tail ? ` (${tail})` : '');
    if (line.trim()) parts.push(line.trim());
  }
  return parts.join('; ');
}

@Injectable()
export class MaterialRequestsService {
  private readonly logger = new Logger(MaterialRequestsService.name);

  constructor(
    private readonly materialRequestsRepository: MaterialRequestsRepository,
    private readonly materialRequestItemsRepository: MaterialRequestItemsRepository,
    private readonly materialRequestHistoryRepository: MaterialRequestHistoryRepository,
    private readonly materialRequestPhotosRepository: MaterialRequestPhotosRepository,
    private readonly materialsService: MaterialsService,
    private readonly sparePartsService: SparePartsService,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly materialRequestPdfService: MaterialRequestPdfService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private isSKURequest(category: RequestCategory): boolean {
    return SKU_REQUEST_CATEGORIES.has(category);
  }

  async exportToPdf(id: string): Promise<string> {
    const materialRequest = await this.materialRequestsRepository.findById(id);
    if (!materialRequest) {
      throw new NotFoundException(
        `Solicitud de material con ID ${id} no encontrada`,
      );
    }

    return this.materialRequestPdfService.generatePdfBase64({
      materialRequest,
      items: materialRequest.items,
      photos: materialRequest.photos,
      histories: materialRequest.histories,
    });
  }

  /**
   * Solo categorías inventariables de refacción con SKU: asocia machineId desde
   * la primera máquina del catálogo enlazada en la solicitud.
   * No aplica a SERVICIO ni refacciones/material no inventariado (quedan fuera de estos sets).
   */
  private resolveMachineIdForInventorySparePartFromRequest(
    category: RequestCategory,
    machines?: Array<{ machineId?: string | null }>,
  ): string | undefined {
    if (!CATALOG_SPARE_PART_CATEGORIES.has(category)) return undefined;
    const row = machines?.find(
      (m) => m.machineId && String(m.machineId).trim(),
    );
    return row?.machineId ?? undefined;
  }

  /**
   * If the item has no catalog reference and a customName, auto-create/reuse a
   * catalog entry (Material or SparePart) to enrich catalogs, while storing the
   * request item as snapshot-only (without linking FK IDs).
   * Only applies to inventory categories — SERVICE, NON_INVENTORY_MATERIAL, and
   * NON_INVENTORY_SPARE_PART are excluded.
   *
   * Para SparePart inventariable se usa `machines` de la solicitud: si hay machineId en
   * alguna fila se guarda en la refacción recién creada (si no existe ya).
   */
  private async resolveCatalogForItem(
    item: CreateMaterialRequestItemInput,
    category: RequestCategory,
    machines?: Array<{ machineId?: string | null }>,
  ): Promise<CreateMaterialRequestItemInput> {
    if (item.materialId || item.sparePartId) return item;

    if (CATALOG_MATERIAL_CATEGORIES.has(category)) {
      const name = item.customName?.trim();
      if (!name) return item;
      // Keep request item as snapshot-only for "Otro" entries.
      await this.materialsService.findOrCreateByDescription(name);
      return { ...item, materialId: undefined };
    }

    if (CATALOG_SPARE_PART_CATEGORIES.has(category)) {
      const lookupKey = item.partNumber?.trim() || item.customName?.trim();
      if (!lookupKey) return item;
      const machineId = this.resolveMachineIdForInventorySparePartFromRequest(
        category,
        machines,
      );
      await this.sparePartsService.findOrCreateByPartNumber(lookupKey, {
        machineId,
        description: item.customName?.trim(),
        brand: item.brand ?? undefined,
        model: item.model ?? undefined,
        sku: item.sku ?? undefined,
        unitOfMeasure: item.unitOfMeasure ?? undefined,
      });
      // Keep request item as snapshot-only for "Otro" entries.
      return { ...item, sparePartId: undefined };
    }

    return item;
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

  /** BOSS (sin ADMIN): solo solicitudes donde es solicitante o jefe a cargo (`boss` = nombre completo). */
  private isBossScopeMatch(user: User, mr: MaterialRequest): boolean {
    return (
      mr.requesterId === user.id ||
      mr.boss.trim().toLowerCase() === user.fullName.trim().toLowerCase()
    );
  }

  private assertBossCanAccessMaterialRequest(
    user: User,
    mr: MaterialRequest,
  ): void {
    if (!user.hasRole('BOSS') || user.hasRole('ADMIN')) return;
    if (this.isBossScopeMatch(user, mr)) return;
    throw new ForbiddenException(
      'No tiene permiso para acceder a esta solicitud de material',
    );
  }

  private assertBossCanManageMaterialRequest(
    user: User,
    mr: MaterialRequest,
  ): void {
    if (!user.hasRole('BOSS') || user.hasRole('ADMIN')) return;
    if (this.isBossScopeMatch(user, mr)) return;
    throw new ForbiddenException(
      'No tiene permiso para gestionar esta solicitud de material',
    );
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  /**
   * Listado administrativo: ADMIN ve todo; jefe (BOSS sin ADMIN) solo solicitudes propias
   * (como solicitante o como jefe a cargo).
   */
  async findAllWithDeletedForUser(user: User): Promise<MaterialRequest[]> {
    if (user.hasRole('ADMIN')) {
      return this.materialRequestsRepository.findAllWithDeleted();
    }
    if (user.hasRole('BOSS')) {
      return this.materialRequestsRepository.findAllWithDeletedForBossScope(
        user.id,
        user.fullName,
      );
    }
    throw new ForbiddenException(
      'No tiene permiso para listar solicitudes de material',
    );
  }

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

  async findByIdForUser(
    id: string,
    user: User,
  ): Promise<MaterialRequest | null> {
    const mr = await this.materialRequestsRepository.findById(id);
    if (!mr) return null;
    this.assertBossCanAccessMaterialRequest(user, mr);
    return mr;
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

  async findByFolioForUser(
    folio: string,
    user: User,
  ): Promise<MaterialRequest | null> {
    const mr = await this.materialRequestsRepository.findByFolio(folio);
    if (!mr) return null;
    this.assertBossCanAccessMaterialRequest(user, mr);
    return mr;
  }

  async findByMachineId(machineId: string): Promise<MaterialRequest[]> {
    return this.materialRequestsRepository.findByMachineId(machineId);
  }

  /** Validates that each machine entry without a machineId has at least a customMachineName. */
  private validateMachines(
    machines: Array<{
      machineId?: string;
      customMachineName?: string;
    }>,
  ): void {
    for (let i = 0; i < machines.length; i++) {
      const m = machines[i];
      if (!m.machineId && !m.customMachineName?.trim()) {
        throw new BadRequestException(
          `La máquina ${i + 1} es de tipo "Otro" y requiere un nombre personalizado`,
        );
      }
    }
  }

  // ─── Mutations ───────────────────────────────────────────────────────────────

  async create(input: CreateMaterialRequestInput): Promise<MaterialRequest> {
    for (const item of input.items ?? []) {
      await this.validateItem(item, input.category);
    }
    this.validateMachines(input.machines);
    const { machines: machineInputs, items: rawItems, ...rest } = input;
    const machines = machineInputs.map((m) => ({
      machineId: m.machineId ?? undefined,
      customMachineName: m.customMachineName ?? undefined,
      customMachineModel: m.customMachineModel ?? undefined,
      customMachineManufacturer: m.customMachineManufacturer ?? undefined,
      customMachineArea: m.customMachineArea ?? undefined,
    }));
    const items = await Promise.all(
      (rawItems ?? []).map((item) =>
        this.resolveCatalogForItem(item, input.category, machines),
      ),
    );
    return this.materialRequestsRepository.create({
      ...rest,
      machines,
      items,
    } as Partial<MaterialRequest>);
  }

  async update(
    id: string,
    input: UpdateMaterialRequestInput,
    user: User,
  ): Promise<MaterialRequest | null> {
    const existing = await this.findByIdOrFail(id);
    this.assertBossCanManageMaterialRequest(user, existing);
    const category = input.category ?? existing.category;
    for (const item of input.items ?? []) {
      await this.validateItem(item, category);
    }
    if (input.machines) {
      this.validateMachines(input.machines);
    }
    const { machines: machineInputs, ...rest } = input;
    const data: Partial<MaterialRequest> = {
      ...rest,
    } as Partial<MaterialRequest>;
    if (machineInputs) {
      data.machines = machineInputs.map((m) => ({
        machineId: m.machineId ?? undefined,
        customMachineName: m.customMachineName ?? undefined,
        customMachineModel: m.customMachineModel ?? undefined,
        customMachineManufacturer: m.customMachineManufacturer ?? undefined,
        customMachineArea: m.customMachineArea ?? undefined,
      })) as unknown as MaterialRequestMachine[];
    }
    return this.materialRequestsRepository.update(id, data);
  }

  async addMaterial(
    materialRequestId: string,
    input: CreateMaterialRequestItemInput,
    user: User,
  ): Promise<MaterialRequestItem> {
    const request = await this.findByIdOrFail(materialRequestId);
    this.assertBossCanManageMaterialRequest(user, request);
    await this.validateItem(input, request.category);
    const resolved = await this.resolveCatalogForItem(
      input,
      request.category,
      request.machines?.map((m) => ({ machineId: m.machineId })),
    );
    return this.materialRequestItemsRepository.create({
      ...resolved,
      materialRequestId,
    });
  }

  async removeMaterial(
    materialRequestItemId: string,
    user: User,
  ): Promise<boolean> {
    const item = await this.materialRequestItemsRepository.findById(
      materialRequestItemId,
    );
    if (!item) {
      throw new NotFoundException('Ítem de solicitud no encontrado');
    }
    const request = await this.findByIdOrFail(item.materialRequestId);
    this.assertBossCanManageMaterialRequest(user, request);
    await this.materialRequestItemsRepository.delete(materialRequestItemId);
    return true;
  }

  async deactivate(id: string, user: User): Promise<boolean> {
    const mr = await this.findByIdOrFail(id);
    this.assertBossCanManageMaterialRequest(user, mr);
    await this.materialRequestsRepository.softDelete(id);
    return true;
  }

  /**
   * Eliminación física de la solicitud de material. Borra todos sus hijos
   * (máquinas, ítems, historial, fotos). Los folios existentes se conservan
   * (se permiten huecos) para no romper referencias externas ya enviadas.
   * Bloquea si el correo ya fue enviado.
   */
  async hardDelete(id: string, user: User): Promise<boolean> {
    const mr = await this.findByIdOrFail(id);
    this.assertBossCanManageMaterialRequest(user, mr);

    if (mr.emailSentAt) {
      throw new BadRequestException(
        'No se puede eliminar permanentemente una solicitud cuyo correo ya fue enviado',
      );
    }

    const filePaths = await this.materialRequestsRepository.hardDelete(id);

    for (const filePath of filePaths) {
      const safeBasename = resolveUploadBasename(filePath);
      if (!safeBasename) continue;
      const absolutePath = join(process.cwd(), 'uploads', safeBasename);
      try {
        await fsPromises.unlink(absolutePath);
      } catch {
        this.logger.warn(
          'No se pudo eliminar archivo físico de solicitud de material',
          { absolutePath },
        );
      }
    }

    this.logger.log(
      `Solicitud de material ${mr.folio} eliminada permanentemente por usuario ${user.id}`,
    );

    return true;
  }

  // ─── Photos ──────────────────────────────────────────────────────────────────

  async addPhoto(
    input: CreateMaterialRequestPhotoInput,
    uploadedBy: string,
    user: User,
  ): Promise<MaterialRequestPhoto> {
    const mr = await this.findByIdOrFail(input.materialRequestId);
    this.assertBossCanManageMaterialRequest(user, mr);

    if (!ALLOWED_PHOTO_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.',
      );
    }

    const count =
      await this.materialRequestPhotosRepository.countByMaterialRequestId(
        input.materialRequestId,
      );

    if (count >= MAX_PHOTOS_PER_REQUEST) {
      throw new BadRequestException(
        `Se permite un máximo de ${MAX_PHOTOS_PER_REQUEST} fotografías por solicitud.`,
      );
    }

    return this.materialRequestPhotosRepository.create({
      materialRequestId: input.materialRequestId,
      filePath: input.filePath,
      fileName: input.fileName,
      mimeType: input.mimeType,
      uploadedBy,
    });
  }

  async removePhoto(id: string, user: User): Promise<boolean> {
    const photo = await this.materialRequestPhotosRepository.findById(id);
    if (!photo) {
      throw new NotFoundException(`Fotografía con ID ${id} no encontrada`);
    }
    const mr = await this.findByIdOrFail(photo.materialRequestId);
    this.assertBossCanManageMaterialRequest(user, mr);
    await this.materialRequestPhotosRepository.softDelete(id);
    return true;
  }

  async findPhotosByRequestId(
    materialRequestId: string,
  ): Promise<MaterialRequestPhoto[]> {
    return this.materialRequestPhotosRepository.findByMaterialRequestId(
      materialRequestId,
    );
  }

  // ─── Email ──────────────────────────────────────────────────────────────────

  async sendEmail(
    input: SendMaterialRequestEmailInput,
    user: User,
  ): Promise<boolean> {
    const request = await this.findByIdOrFail(input.materialRequestId);
    this.assertBossCanManageMaterialRequest(user, request);

    if (request.emailSentAt) {
      throw new BadRequestException(
        'El correo de esta solicitud ya fue enviado',
      );
    }

    const machineMachines = request.machines ?? [];
    const areaNames = new Set<string>();
    for (const mrm of machineMachines) {
      const name =
        mrm.machine?.area?.name ??
        mrm.machine?.subArea?.area?.name ??
        mrm.customMachineArea;
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

    // ── Load photos and build email attachments ───────────────────────────────
    const dbPhotos =
      await this.materialRequestPhotosRepository.findByMaterialRequestId(
        request.id,
      );

    const uploadsDir = join(process.cwd(), 'uploads');

    const attachments: Array<{
      filename: string;
      path: string;
      cid: string;
      contentType: string;
    }> = [];

    const photoTemplateData: Array<{ cid: string; fileName: string }> = [];

    dbPhotos.forEach((photo, index) => {
      const fileName = basename(photo.filePath);
      const filePath = join(uploadsDir, fileName);

      if (!existsSync(filePath)) {
        this.logger.warn(
          `Photo file not found on disk, skipping attachment: ${filePath}`,
        );
        return;
      }

      const cid = `mr-photo-${index}`;
      attachments.push({
        filename: photo.fileName,
        path: filePath,
        cid,
        contentType: photo.mimeType,
      });
      photoTemplateData.push({ cid, fileName: photo.fileName });
    });

    const templateData: MaterialRequestEmailTemplateData = {
      folio: request.folio,
      createdAt: formatDate(request.createdAt),
      requesterName: request.requester.fullName,
      requesterEmployeeNumber: request.requester.employeeNumber,
      boss: request.boss,
      category: CATEGORY_LABELS[request.category] ?? request.category,
      priority: PRIORITY_LABELS[request.priority] ?? request.priority,
      importance: request.importance
        ? (IMPORTANCE_LABELS[request.importance] ?? request.importance)
        : undefined,
      derivedAreaName,
      machines: machineMachines.map((mrm) => ({
        name: mrm.customMachineName ?? mrm.machine?.name ?? '',
        brand: mrm.machine?.brand,
        model: mrm.customMachineModel ?? mrm.machine?.model,
        manufacturer:
          mrm.customMachineManufacturer ?? mrm.machine?.manufacturer,
        areaName:
          mrm.machine?.area?.name ??
          mrm.machine?.subArea?.area?.name ??
          mrm.customMachineArea,
        subAreaName: mrm.machine?.subArea?.name,
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
      photos: photoTemplateData.length > 0 ? photoTemplateData : undefined,
    };

    const html =
      this.emailTemplateService.renderMaterialRequestTemplate(templateData);

    await this.emailService.send({
      to: input.to,
      cc: input.cc,
      subject: `Solicitud de Material ${request.folio}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
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
    user: User,
  ): Promise<MaterialRequest> {
    const mr = await this.findByIdOrFail(input.materialRequestId);
    this.assertBossCanManageMaterialRequest(user, mr);

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

    const effectiveDeliveryDate = input.deliveryDate ?? existing?.deliveryDate;

    if (input.status === StatusHistoryMR.DELIVERED && !effectiveDeliveryDate) {
      throw new BadRequestException(
        'La fecha de entrega es requerida para marcar como entregado',
      );
    }

    const progressPercentage = STATUS_PROGRESS_MAP[input.status];

    await this.materialRequestHistoryRepository.upsert(
      input.materialRequestId,
      {
        status: input.status,
        purchaseRequest: input.purchaseRequest,
        purchaseOrder: input.purchaseOrder,
        deliveryMerchandise: input.deliveryMerchandise,
        supplier: input.supplier,
        quotationNumber: input.quotationNumber,
        quotationCost: input.quotationCost,
        progressPercentage,
        ...(input.deliveryDate !== undefined && {
          deliveryDate: input.deliveryDate,
        }),
        ...(input.estimatedDeliveryDate !== undefined && {
          estimatedDeliveryDate: input.estimatedDeliveryDate,
        }),
      },
    );

    return this.findByIdOrFail(input.materialRequestId);
  }

  /**
   * Exporta seguimiento de solicitudes a Excel (una fila por artículo).
   * Filtros deben mantenerse alineados con MaterialRequestHistoryPage.
   */
  async exportHistoryTrackingToExcelBuffer(
    user: User,
    filters: MaterialRequestHistoryExportFiltersInput,
  ): Promise<Buffer> {
    const all = await this.findAllWithDeletedForUser(user);
    const search = (filters.search ?? '').trim().toLowerCase();
    const filterStatus = filters.status ?? 'all';
    const filterCategory = filters.category ?? 'all';
    const filterArea = filters.area ?? 'all';

    const filtered = all.filter((r) => {
      const matchSearch =
        !search ||
        r.folio.toLowerCase().includes(search) ||
        (r.requester?.fullName ?? '').toLowerCase().includes(search) ||
        (r.machines ?? []).some((mrm) =>
          (mrm.machine?.name ?? mrm.customMachineName ?? '')
            .toLowerCase()
            .includes(search),
        );
      const h = exportGetLatestHistory(r.histories);
      const matchStatus =
        filterStatus === 'all' ||
        h?.status === (filterStatus as StatusHistoryMR);
      const matchCategory =
        filterCategory === 'all' ||
        r.category === (filterCategory as RequestCategory);
      const area = exportDeriveArea(r.machines ?? []);
      const matchArea = filterArea === 'all' || area === filterArea;
      return matchSearch && matchStatus && matchCategory && matchArea;
    });

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Solicitudes');

    ws.columns = [
      { header: 'Folio', key: 'folio', width: 16 },
      { header: 'Fecha creación', key: 'fechaCreacion', width: 18 },
      { header: 'Activa', key: 'activa', width: 8 },
      { header: 'Correo enviado', key: 'correoEnviado', width: 18 },
      { header: 'Categoría', key: 'categoria', width: 22 },
      { header: 'Prioridad', key: 'prioridad', width: 14 },
      { header: 'Importancia', key: 'importancia', width: 14 },
      { header: 'Jefe a cargo', key: 'jefe', width: 24 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Justificación', key: 'justificacion', width: 32 },
      { header: 'Comentarios', key: 'comentarios', width: 32 },
      { header: 'Proveedor sugerido', key: 'proveedorSugerido', width: 22 },
      { header: 'Área', key: 'area', width: 20 },
      { header: 'Solicitante', key: 'solicitante', width: 26 },
      { header: 'No. empleado', key: 'noEmpleado', width: 14 },
      { header: 'Estatus seguimiento', key: 'estatusSeguimiento', width: 22 },
      { header: 'S.C.', key: 'solicitudCompra', width: 16 },
      { header: 'O.C.', key: 'ordenCompra', width: 16 },
      { header: 'Núm. cotización', key: 'numeroCotizacion', width: 18 },
      { header: 'Costo cotización', key: 'costoCotizacion', width: 16 },
      { header: 'E.M.', key: 'entregaMercancia', width: 16 },
      { header: 'Proveedor (compras)', key: 'proveedorCompras', width: 22 },
      {
        header: 'Fecha entrega estimada',
        key: 'fechaEntregaEstimada',
        width: 18,
      },
      { header: 'Fecha entrega', key: 'fechaEntrega', width: 18 },
      { header: '% avance', key: 'porcentajeAvance', width: 10 },
      { header: 'Máquinas', key: 'maquinas', width: 48 },
      { header: 'Fotos (nombres)', key: 'fotosNombres', width: 36 },
      { header: 'Ítem descripción', key: 'itemDescripcion', width: 32 },
      { header: 'Ítem nombre', key: 'itemNombreCustom', width: 24 },
      { header: 'Ítem SKU', key: 'itemSku', width: 14 },
      { header: 'Ítem no. parte', key: 'itemNoParte', width: 16 },
      { header: 'Ítem marca', key: 'itemMarca', width: 14 },
      { header: 'Ítem modelo', key: 'itemModelo', width: 14 },
      { header: 'Ítem cantidad', key: 'itemCantidad', width: 12 },
      { header: 'Ítem U.M.', key: 'itemUM', width: 10 },
      { header: 'Ítem stock máx. prop.', key: 'itemStockMax', width: 14 },
      { header: 'Ítem stock mín. prop.', key: 'itemStockMin', width: 14 },
      { header: 'Ítem genérico permitido', key: 'itemGenerico', width: 12 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.height = 18;
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns?.length ?? 38 },
    };

    for (const r of filtered) {
      const h = exportGetLatestHistory(r.histories);
      const area = exportDeriveArea(r.machines ?? []);
      const photoNames = (r.photos ?? [])
        .map((p) => p.fileName)
        .filter(Boolean)
        .join('; ');

      const base = {
        folio: r.folio,
        fechaCreacion: exportFormatDateTime(r.createdAt),
        activa: r.isActive ? 'Sí' : 'No',
        correoEnviado: r.emailSentAt ? exportFormatDateTime(r.emailSentAt) : '',
        categoria: CATEGORY_LABELS[r.category] ?? r.category,
        prioridad: PRIORITY_LABELS[r.priority] ?? r.priority,
        importancia: r.importance
          ? (IMPORTANCE_LABELS[r.importance] ?? r.importance)
          : '',
        jefe: r.boss ?? '',
        descripcion: (r.description ?? '').slice(0, 5000),
        justificacion: (r.justification ?? '').slice(0, 5000),
        comentarios: (r.comments ?? '').slice(0, 5000),
        proveedorSugerido: r.suggestedSupplier ?? '',
        area,
        solicitante: r.requester?.fullName ?? '',
        noEmpleado: r.requester?.employeeNumber ?? '',
        estatusSeguimiento: h?.status
          ? (STATUS_LABELS[h.status] ?? h.status)
          : '',
        solicitudCompra: h?.purchaseRequest ?? '',
        ordenCompra: h?.purchaseOrder ?? '',
        numeroCotizacion: h?.quotationNumber ?? '',
        costoCotizacion:
          h?.quotationCost != null ? String(h.quotationCost) : '',
        entregaMercancia: h?.deliveryMerchandise ?? '',
        proveedorCompras: h?.supplier ?? '',
        fechaEntregaEstimada: h?.estimatedDeliveryDate
          ? exportFormatDateTime(h.estimatedDeliveryDate)
          : '',
        fechaEntrega: h?.deliveryDate
          ? exportFormatDateTime(h.deliveryDate)
          : '',
        porcentajeAvance:
          h?.progressPercentage != null ? String(h.progressPercentage) : '',
        maquinas: exportMachinesSummary(r.machines ?? []),
        fotosNombres: photoNames,
      };

      const items = r.items ?? [];
      if (items.length === 0) {
        ws.addRow({
          ...base,
          itemDescripcion: '— Sin artículos —',
          itemNombreCustom: '',
          itemSku: '',
          itemNoParte: '',
          itemMarca: '',
          itemModelo: '',
          itemCantidad: '',
          itemUM: '',
          itemStockMax: '',
          itemStockMin: '',
          itemGenerico: '',
        });
      } else {
        for (const it of items) {
          ws.addRow({
            ...base,
            itemDescripcion: it.description ?? '',
            itemNombreCustom: it.customName ?? '',
            itemSku: it.sku ?? '',
            itemNoParte: it.partNumber ?? '',
            itemMarca: it.brand ?? '',
            itemModelo: it.model ?? '',
            itemCantidad:
              it.requestedQuantity != null ? String(it.requestedQuantity) : '',
            itemUM: it.unitOfMeasure ?? '',
            itemStockMax:
              it.proposedMaxStock != null ? String(it.proposedMaxStock) : '',
            itemStockMin:
              it.proposedMinStock != null ? String(it.proposedMinStock) : '',
            itemGenerico: it.isGenericAllowed ? 'Sí' : 'No',
          });
        }
      }
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
