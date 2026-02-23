import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkOrderMaterial } from "../../domain/entities";

@Injectable()
export class WorkOrderMaterialsRepository {
    constructor(@InjectRepository(WorkOrderMaterial) private readonly repository: Repository<WorkOrderMaterial>) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderMaterial[]> {
        return this.repository.find({
            where: { workOrderId, isActive: true },
            relations: ['material'],
            order: { createdAt: 'ASC' },
        });
    }

    async findById(id: string): Promise<WorkOrderMaterial | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['material'],
        });
    }

    async create(data: Partial<WorkOrderMaterial>): Promise<WorkOrderMaterial> {
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
