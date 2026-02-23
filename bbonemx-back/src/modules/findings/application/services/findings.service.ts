import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindingsRepository } from "../../infrastructure/repositories";
import { WorkOrdersService } from "src/modules/work-orders";
import { Finding } from "../../domain/entities";
import { FindingFiltersInput, FindingPaginationInput, FindingSortInput } from "../dto";
import { FindingStatus, MaintenanceType } from "src/common";

@Injectable()
export class FindingsService {
    constructor(
        private readonly findingsRepository: FindingsRepository,
        private readonly workOrdersService: WorkOrdersService
    ) { }

    findAll(): Promise<Finding[]> {
        return this.findingsRepository.findAll();
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

    getStatsByStatus(): Promise<{status: string, count: number}[]> {
        return this.findingsRepository.getStatsByStatus();
    }

    countOpen(): Promise<number> {
        return this.findingsRepository.countOpen();
    }

    async create(data: Partial<Finding>): Promise<Finding> {
        return this.findingsRepository.create(data);
    }

    async update(id: string, data: Partial<Finding>): Promise<Finding | null> {
        const finding = await this.findByIdOrFail(id);
        return this.findingsRepository.update(id, data);
    }

    async softDelete(id: string): Promise<void> {
        await this.findByIdOrFail(id);
        await this.findingsRepository.softDelete(id);
    }

    async convertToWorkOrder(id: string): Promise<Finding> {
        const finding = await this.findByIdOrFail(id);
        if(!finding.canBeConvertedToWo()) throw new BadRequestException('El hallazgo no puede ser convertido a orden de trabajo');

        const workOrder = await this.workOrdersService.create({
            areaId: finding.areaId,
            description: finding.description,
            machineId: finding.machineId,
        }, finding.createdBy || '');

        await this.workOrdersService.update(workOrder.id, {
            maintenanceType: MaintenanceType.FINDING,
        });

        await this.workOrdersService.linkFinding(workOrder.id, id);

        await this.findingsRepository.update(id, {
            status: FindingStatus.CONVERTED_TO_WO,
            convertedToWoId: workOrder.id,
            convertedAt: new Date(),
            convertedBy: finding.createdBy,
        });

        return this.findByIdOrFail(id);
    }

}