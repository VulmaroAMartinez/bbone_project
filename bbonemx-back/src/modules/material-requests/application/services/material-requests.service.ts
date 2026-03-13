import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { MaterialRequestsRepository, MaterialRequestItemsRepository } from "../../infrastructure/repositories";
import { MaterialRequest, MaterialRequestItem } from "../../domain/entities";
import { CreateMaterialRequestInput, UpdateMaterialRequestInput, CreateMaterialRequestItemInput } from "../dto";
import { RequestCategory } from "src/common";
import { MaterialsService } from "src/modules/catalogs/materials/application/services";
import { SparePartsService } from "src/modules/catalogs/spare-parts/application/services";

/** Categories that represent a request for a brand-new SKU (no catalog entry exists yet). */
const SKU_REQUEST_CATEGORIES = new Set<RequestCategory>([
    RequestCategory.REQUEST_SKU_MATERIAL,
    RequestCategory.REQUEST_SKU_SPARE_PART,
]);

@Injectable()
export class MaterialRequestsService {
    constructor(
        private readonly materialRequestsRepository: MaterialRequestsRepository,
        private readonly materialRequestItemsRepository: MaterialRequestItemsRepository,
        private readonly materialsService: MaterialsService,
        private readonly sparePartsService: SparePartsService,
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
            // Validate that the referenced catalog entity exists
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
                errors.push('La marca (brand) es requerida para solicitudes de creación de SKU');
            }
            if (!item.partNumber?.trim()) {
                errors.push('El número de parte (partNumber) es requerido para solicitudes de creación de SKU');
            }
            if (item.proposedMaxStock == null) {
                errors.push('El stock máximo propuesto (proposedMaxStock) es requerido para solicitudes de creación de SKU');
            }
            if (item.proposedMinStock == null) {
                errors.push('El stock mínimo propuesto (proposedMinStock) es requerido para solicitudes de creación de SKU');
            }
            if (item.proposedMinStock != null && item.proposedMinStock < 0) {
                errors.push('El stock mínimo propuesto debe ser mayor o igual a 0');
            }
            if (
                item.proposedMaxStock != null &&
                item.proposedMinStock != null &&
                item.proposedMaxStock <= item.proposedMinStock
            ) {
                errors.push('El stock máximo propuesto debe ser mayor al stock mínimo propuesto');
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
            throw new NotFoundException(`Solicitud de material con ID ${id} no encontrada`);
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
        return this.materialRequestsRepository.create(input as Partial<MaterialRequest>);
    }

    async update(id: string, input: UpdateMaterialRequestInput): Promise<MaterialRequest | null> {
        const existing = await this.findByIdOrFail(id);
        const category = input.category ?? existing.category;
        for (const item of input.items ?? []) {
            await this.validateItem(item, category);
        }
        return this.materialRequestsRepository.update(id, input as Partial<MaterialRequest>);
    }

    async addMaterial(materialRequestId: string, input: CreateMaterialRequestItemInput): Promise<MaterialRequestItem> {
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
}
