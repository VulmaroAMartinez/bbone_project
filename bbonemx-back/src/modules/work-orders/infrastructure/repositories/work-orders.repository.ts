import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkOrder } from "../../domain/entities";
import { WorkOrderFiltersInput, PaginationInput, WorkOrderSortInput } from "../../application/dto/work-order-filters.dto";
import { WorkOrderStats } from "../../presentation/types/work-order.type";
import { FolioGenerator } from "src/common/utils/folio-generator.util";

@Injectable()
export class WorkOrdersRepository {
    constructor(@InjectRepository(WorkOrder) private readonly repository: Repository<WorkOrder>) {}

    //Obtener todas las WO activas con relaciones básicas
    async findAll(): Promise<WorkOrder[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['area', 'subArea', 'requester', 'requester.department', 'assignedShift', 'machine'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    //Busca WO por id con todas las relaciones
    async findById(id: string): Promise<WorkOrder | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: [
                'area',
                'subArea',
                'requester',
                'requester.role',
                'requester.department',
                'assignedShift',
                'machine',
            ],
        });
    }

    async findByFolio(folio: string): Promise<WorkOrder | null> {
        return this.repository.findOne({
            where: { folio, isActive: true },
            relations: [
                'area',
                'subArea',
                'requester',
                'requester.department',
                'assignedShift',
                'machine',
            ],
        });
    }

    async findByTechnicianId(technicianId: string): Promise<WorkOrder[]> {
        return this.repository
        .createQueryBuilder('wo')
        .innerJoin('work_order_technicians', 'wot', 'wot.work_order_id = wo.id')
        .where('wot.technician_id = :technicianId', { technicianId })
        .andWhere('wo.is_active = true')
        .andWhere('wot.is_active = true')
        .leftJoinAndSelect('wo.area', 'area')
        .leftJoinAndSelect('wo.subArea', 'subArea')
        .leftJoinAndSelect('wo.requester', 'requester')
        .leftJoinAndSelect('requester.role', 'requesterRole')
        .leftJoinAndSelect('requester.department', 'requesterDepartment')
        .leftJoinAndSelect('wo.assignedShift', 'assignedShift')
        .leftJoinAndSelect('wo.machine', 'machine')
        .orderBy('wo.created_at', 'DESC')
        .getMany();
    }

    async findByRequesterId(requesterId: string): Promise<WorkOrder[]> {
        return this.repository.find({
            where: { requesterId, isActive: true },
            relations: ['area', 'subArea', 'requester', 'requester.department', 'assignedShift', 'machine'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    //Búsqued con filtros, páginación y ordenamiento
    async findWithFilters(
        filters: WorkOrderFiltersInput, 
        pagination: PaginationInput, 
        sort: WorkOrderSortInput): Promise<{ data: WorkOrder[]; total: number }> {
            const qb = this.repository.createQueryBuilder('wo')
            .leftJoinAndSelect('wo.area', 'area')
            .leftJoinAndSelect('wo.subArea', 'subArea')
            .leftJoinAndSelect('wo.requester', 'requester')
            .leftJoinAndSelect('requester.role', 'role')
            .leftJoinAndSelect('requester.department', 'department')
            .leftJoinAndSelect('wo.assignedShift', 'assignedShift')
            .leftJoinAndSelect('wo.machine', 'machine')
            .where('wo.is_active = true')

            if (filters) {
                if (filters.status) {
                  qb.andWhere('wo.status = :status', { status: filters.status });
                }
                if (filters.statuses && filters.statuses.length > 0) {
                  qb.andWhere('wo.status IN (:...statuses)', { statuses: filters.statuses });
                }
                if (filters.priority) {
                  qb.andWhere('wo.priority = :priority', { priority: filters.priority });
                }
                if (filters.maintenanceType) {
                  qb.andWhere('wo.maintenance_type = :maintenanceType', { maintenanceType: filters.maintenanceType });
                }
                if (filters.areaId) {
                  qb.andWhere('wo.area_id = :areaId', { areaId: filters.areaId });
                }
                if (filters.requesterId) {
                  qb.andWhere('wo.requester_id = :requesterId', { requesterId: filters.requesterId });
                }
                if (filters.assignedShiftId) {
                  qb.andWhere('wo.assigned_shift_id = :assignedShiftId', { assignedShiftId: filters.assignedShiftId });
                }
                if (filters.technicianId) {
                  qb.innerJoin('work_order_technicians', 'wot', 'wot.work_order_id = wo.id AND wot.is_active = true')
                    .andWhere('wot.technician_id = :technicianId', { technicianId: filters.technicianId });
                }
                if (filters.createdFrom) {
                  qb.andWhere('wo.created_at >= :createdFrom', { createdFrom: filters.createdFrom });
                }
                if (filters.createdTo) {
                  qb.andWhere('wo.created_at <= :createdTo', { createdTo: filters.createdTo });
                }
                if (filters.search) {
                  qb.andWhere('(wo.folio ILIKE :search OR wo.description ILIKE :search)', { 
                    search: `%${filters.search}%` 
                  });
                }
              }

              const total = await qb.getCount();

              const sortField = sort?.field || 'createdAt';
              const sortOrder = sort?.order || 'DESC';
              qb.orderBy(`wo.${sortField}`, sortOrder);

              const page = pagination?.page || 1;
              const limit = pagination?.limit || 20;
              qb.skip((page - 1) * limit).take(limit);

              const data = await qb.getMany();

              return { data, total };
    }

    async create(data: Partial<WorkOrder>): Promise<WorkOrder> {
        const result = await this.repository.query(
            `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq FROM work_orders`
        );
        const sequence = Number(result[0].next_seq);
        const folio = FolioGenerator.generateWorkOrderFolio(sequence, new Date());
        const entity = this.repository.create({ ...data, sequence, folio });
        return this.repository.save(entity);
    }

    async update(id: string, data: Partial<WorkOrder>): Promise<WorkOrder | null> {
        const workOrder = await this.repository.findOne({ where: { id } });
        if (!workOrder) return null;
        Object.assign(workOrder, data);
        return this.repository.save(workOrder);
    }

    async softDelete(id: string): Promise<void> {
        const workOrder = await this.repository.findOne({ where: { id } });
        if (!workOrder) return;
        workOrder.isActive = false;
        workOrder.deletedAt = new Date();
        await this.repository.save(workOrder);
    }
    
    async restore(id: string): Promise<void> {
        const workOrder = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!workOrder) return;
        workOrder.isActive = true;
        workOrder.deletedAt = undefined;
        await this.repository.save(workOrder);
    }

    async getStatsByStatus(): Promise<{status: string, count: number}[]> {
        return this.repository.createQueryBuilder('wo')
        .select('wo.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('wo.is_active = true')
        .groupBy('wo.status')
        .getRawMany();
    }

    getRepository(): Repository<WorkOrder> {
        return this.repository;
    }

}
