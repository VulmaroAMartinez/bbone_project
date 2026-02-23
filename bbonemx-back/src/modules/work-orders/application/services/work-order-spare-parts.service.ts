import { Injectable, NotFoundException } from "@nestjs/common";
import { WorkOrderSparePartsRepository } from "../../infrastructure/repositories";
import { WorkOrderSparePart } from "../../domain/entities";
import { AddWorkOrderSparePartInput } from "../dto";

@Injectable()
export class WorkOrderSparePartsService {
    constructor(private readonly repository: WorkOrderSparePartsRepository) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderSparePart[]> {
        return this.repository.findByWorkOrderId(workOrderId);
    }

    async add(input: AddWorkOrderSparePartInput): Promise<WorkOrderSparePart> {
        return this.repository.create({
            workOrderId: input.workOrderId,
            sparePartId: input.sparePartId,
            quantity: input.quantity ?? 1,
            notes: input.notes,
        });
    }

    async remove(id: string): Promise<void> {
        const record = await this.repository.findById(id);
        if (!record) throw new NotFoundException('Refacción de OT no encontrada');
        await this.repository.softDelete(id);
    }
}
