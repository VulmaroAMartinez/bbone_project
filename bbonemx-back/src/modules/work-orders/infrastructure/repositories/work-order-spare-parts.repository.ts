import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkOrderSparePart } from "../../domain/entities";

@Injectable()
export class WorkOrderSparePartsRepository {
    constructor(@InjectRepository(WorkOrderSparePart) private readonly repository: Repository<WorkOrderSparePart>) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderSparePart[]> {
        return this.repository.find({
            where: { workOrderId, isActive: true },
            relations: ['sparePart'],
            order: { createdAt: 'ASC' },
        });
    }

    async findById(id: string): Promise<WorkOrderSparePart | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['sparePart'],
        });
    }

    async create(data: Partial<WorkOrderSparePart>): Promise<WorkOrderSparePart> {
        return this.repository.save(this.repository.create(data));
    }

    async softDelete(id: string): Promise<void> {
        const record = await this.repository.findOne({ where: { id } });
        if (!record) return;
        record.isActive = false;
        record.deletedAt = new Date();
        await this.repository.save(record);
    }
}
