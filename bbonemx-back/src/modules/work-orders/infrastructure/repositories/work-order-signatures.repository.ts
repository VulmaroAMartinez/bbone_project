import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkOrderSignature } from "../../domain/entities";

@Injectable()
export class WorkOrderSignaturesRepository {
    constructor(@InjectRepository(WorkOrderSignature) private readonly repository: Repository<WorkOrderSignature>) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderSignature[]> {
        return this.repository.find({
            where: { workOrderId: workOrderId, isActive: true },
            relations: ['signer', 'signer.role'],
            order: { signedAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<WorkOrderSignature | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['workOrder','signer', 'signer.role'],
        });
    }

    async findByWorkOrderAndSigner(workOrderId: string, signerId: string): Promise<WorkOrderSignature | null> {
        return this.repository.findOne({
            where: { workOrderId: workOrderId, signerId: signerId, isActive: true },
            relations: ['signer'],
        });
    }

    async create(data: Partial<WorkOrderSignature>): Promise<WorkOrderSignature> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<WorkOrderSignature>): Promise<WorkOrderSignature | null> {
        const workOrderSignature = await this.repository.findOne({ where: { id } });
        if (!workOrderSignature) return null;
        Object.assign(workOrderSignature, data);
        return this.repository.save(workOrderSignature);
    }
    
    async softDelete(id: string): Promise<void> {
        const workOrderSignature = await this.repository.findOne({ where: { id } });
        if (!workOrderSignature) return;
        workOrderSignature.isActive = false;
        workOrderSignature.deletedAt = new Date();
        await this.repository.save(workOrderSignature);
    }
    
    
    async countByWorkOrderId(workOrderId: string): Promise<number> {
        return this.repository.count({ where: { workOrderId: workOrderId, isActive: true } });
    }

    async hasUserSigned(workOrderId: string, signerId: string): Promise<boolean> {
        const count = await this.repository.count({ where: { workOrderId: workOrderId, signerId: signerId, isActive: true } });
        return count > 0;
    }
}