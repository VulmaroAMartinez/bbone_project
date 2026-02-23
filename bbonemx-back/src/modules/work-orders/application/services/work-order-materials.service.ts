import { Injectable, NotFoundException } from "@nestjs/common";
import { WorkOrderMaterialsRepository } from "../../infrastructure/repositories";
import { WorkOrderMaterial } from "../../domain/entities";
import { AddWorkOrderMaterialInput } from "../dto";

@Injectable()
export class WorkOrderMaterialsService {
    constructor(private readonly repository: WorkOrderMaterialsRepository) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderMaterial[]> {
        return this.repository.findByWorkOrderId(workOrderId);
    }

    async add(input: AddWorkOrderMaterialInput): Promise<WorkOrderMaterial> {
        return this.repository.create({
            workOrderId: input.workOrderId,
            materialId: input.materialId,
            quantity: input.quantity ?? 1,
            notes: input.notes,
        });
    }

    async remove(id: string): Promise<void> {
        const record = await this.repository.findById(id);
        if (!record) throw new NotFoundException('Material de OT no encontrado');
        await this.repository.softDelete(id);
    }
}
