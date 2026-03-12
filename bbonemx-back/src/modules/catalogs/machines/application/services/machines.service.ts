import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { MachinesRepository } from "../../infrastructure/repositories";
import { Machine } from "../../domain/entities";
import { CreateMachineInput, UpdateMachineInput } from "../dto";
import { AreasService } from "src/modules/catalogs/areas/application/services";
import { SubAreasService } from "src/modules/catalogs/sub-areas/application/services";

@Injectable()
export class MachinesService {
    constructor(
        private readonly machinesRepository: MachinesRepository,
        private readonly areasService: AreasService,
        private readonly subAreasService: SubAreasService,
    ) {}

    async findAll(): Promise<Machine[]> {
        return this.machinesRepository.findAll();
    }

    async findAllWithDeleted(): Promise<Machine[]> {
        return this.machinesRepository.findAllWithDeleted();
    }

    async findAllActive(): Promise<Machine[]> {
        return this.machinesRepository.findAllActive();
    }

    async findById(id: string): Promise<Machine | null> {
        return this.machinesRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Machine> {
        const machine = await this.machinesRepository.findById(id);
        if (!machine) {
            throw new NotFoundException(`Máquina con ID ${id} no encontrada`);
        }
        return machine;
    }

    async findBySubAreaId(subAreaId: string): Promise<Machine[]> {
        return this.machinesRepository.findBySubAreaId(subAreaId);
    }

    async findByAreaId(areaId: string): Promise<Machine[]> {
        return this.machinesRepository.findByAreaId(areaId);
    }

    /**
     * Búsqueda flexible de máquinas activas por área y/o sub-área.
     */
    async findByAreaOrSubArea(areaId?: string, subAreaId?: string): Promise<Machine[]> {
        return this.machinesRepository.findByAreaOrSubArea(areaId, subAreaId);
    }

    async create(input: CreateMachineInput): Promise<Machine> {
        await this.validateAreaSubAreaXor(input.areaId, input.subAreaId);
        return this.machinesRepository.create(input);
    }

    async update(id: string, input: UpdateMachineInput): Promise<Machine | null> {
        const existing = await this.findByIdOrFail(id);

        // Determinar los valores finales para la validación XOR
        const finalAreaId = input.areaId !== undefined ? input.areaId : existing.areaId;
        const finalSubAreaId = input.subAreaId !== undefined ? input.subAreaId : existing.subAreaId;

        // Si se envía areaId, limpiar subAreaId y viceversa
        const data: Partial<Machine> = { ...input };
        if (input.areaId) {
            data.subAreaId = null as any;
        } else if (input.subAreaId) {
            data.areaId = null as any;
        }

        await this.validateAreaSubAreaXor(data.areaId ?? finalAreaId, data.subAreaId ?? finalSubAreaId);

        return this.machinesRepository.update(id, data);
    }

    async deactivate(id: string) {
        await this.findByIdOrFail(id);
        await this.machinesRepository.softDelete(id);
        return this.findByIdOrFail(id);
    }

    async activate(id: string) {
        await this.findByIdOrFail(id);
        await this.machinesRepository.restore(id);
        return this.findByIdOrFail(id);
    }

    // ── Validación de integridad: exactamente uno de areaId/subAreaId ──

    private async validateAreaSubAreaXor(areaId?: string | null, subAreaId?: string | null): Promise<void> {
        const hasArea = !!areaId;
        const hasSubArea = !!subAreaId;

        if (!hasArea && !hasSubArea) {
            throw new BadRequestException('Debe especificar areaId o subAreaId');
        }

        if (hasArea && hasSubArea) {
            throw new BadRequestException('No puede especificar areaId y subAreaId simultáneamente. Use solo uno.');
        }

        // Validar que el área o sub-área exista
        if (hasArea) {
            await this.areasService.findByIdOrFail(areaId!);
        }

        if (hasSubArea) {
            await this.subAreasService.findByIdOrFail(subAreaId!);
        }
    }
}
