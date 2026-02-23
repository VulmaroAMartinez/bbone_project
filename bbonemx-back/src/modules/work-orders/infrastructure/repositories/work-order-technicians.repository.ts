import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { WorkOrderTechnician } from "../../domain/entities";

@Injectable()
export class WorkOrderTechniciansRepository {
    constructor(@InjectRepository(WorkOrderTechnician) private readonly repository: Repository<WorkOrderTechnician>) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderTechnician[]> {
        return this.repository.find({
          where: { workOrderId: workOrderId, isActive: true },
          relations: ['technician', 'technician.role', 'assigner'],
          order: { isLead: 'DESC', assignedAt: 'ASC' },
        });
    }

    async findByTechnicianId(technicianId: string): Promise<WorkOrderTechnician[]> {
        return this.repository.find({
            where: { technicianId, isActive: true },
            relations: [ 'workOrder', 'workOrder.area' ],
            order: { assignedAt: 'DESC' },
        });
    }

    async findByWorkOrderAndTechnician(workOrderId: string, technicianId: string): Promise<WorkOrderTechnician | null> {
        return this.repository.findOne({
            where: { workOrderId: workOrderId, technicianId: technicianId, isActive: true },
            relations: [ 'workOrder', 'workOrder.area' ],
        });
    }

    async findById(id: string): Promise<WorkOrderTechnician | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: [ 'workOrder', 'technician', 'technician.role', 'assigner', 'assigner.role' ],
        });
    }

    async findLeadByWorkOrderId(workOrderId: string): Promise<WorkOrderTechnician | null> {
        return this.repository.findOne({
            where: { workOrderId: workOrderId, isLead: true, isActive: true },
            relations: [ 'technician' ],
        });
    }

    async create(data: Partial<WorkOrderTechnician>): Promise<WorkOrderTechnician> {
        const created = await this.repository.save(this.repository.create(data));
        return (await this.findById(created.id)) ?? created;
    }

    async update(id: string, data: Partial<WorkOrderTechnician>): Promise<WorkOrderTechnician | null> {
        const workOrderTechnician = await this.repository.findOne({ where: { id } });
        if (!workOrderTechnician) return null;
        Object.assign(workOrderTechnician, data);
        const updated = await this.repository.save(workOrderTechnician);
        return (await this.findById(updated.id)) ?? updated;
    }

    async softDelete(id: string): Promise<void> {
        const workOrderTechnician = await this.repository.findOne({ where: { id } });
        if (!workOrderTechnician) return;
        workOrderTechnician.isActive = false;
        workOrderTechnician.deletedAt = new Date();
        await this.repository.save(workOrderTechnician);
    }

    async delete(where: FindOptionsWhere<WorkOrderTechnician>): Promise<void> {
        await this.repository.delete(where);
    }

    async removeLeadFromAll(workOrderId: string): Promise<void> {
        await this.repository.update({ workOrderId: workOrderId, isLead: true, isActive: true }, { isLead: false });
    }

    async countByWorkOrderId(workOrderId: string): Promise<number> {
        return this.repository.count({ where: { workOrderId: workOrderId, isActive: true } });
    }

    async isTechnicianAssigned(workOrderId: string, technicianId: string): Promise<boolean> {
        const count = await this.repository.count({ where: { workOrderId: workOrderId, technicianId: technicianId, isActive: true } });
        return count > 0;
    }

}
