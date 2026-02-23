import { Injectable, NotFoundException } from "@nestjs/common";
import { Finding } from "../../domain/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindingStatus } from "src/common";
import { FindingFiltersInput, FindingPaginationInput, FindingSortInput } from "../../application/dto";

@Injectable()
export class FindingsRepository {
    constructor (
        @InjectRepository(Finding)
        private readonly repository: Repository<Finding>
    ) {}

    async findAll(): Promise<Finding[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['area', 'machine', 'shift', 'converter'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findAllOpen(): Promise<Finding[]> {
        return this.repository.find({
            where: { isActive: true, status: FindingStatus.OPEN },
            relations: ['area', 'machine', 'shift'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findById(id: string): Promise<Finding | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['area', 'machine', 'shift', 'converter'],
        });
    }

    async findByCreatedBy(createdBy: string): Promise<Finding[]> {
        return this.repository.find({
            where: { createdBy, isActive: true },
            relations: ['area', 'machine', 'shift'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findByAreaId(areaId: string): Promise<Finding[]> {
        return this.repository.find({
            where: { areaId, isActive: true },
            relations: ['area', 'machine', 'shift'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findByShiftId(shiftId: string): Promise<Finding[]> {
        return this.repository.find({
            where: { shiftId, isActive: true },
            relations: ['area', 'machine', 'shift'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async findByFolio(folio: string): Promise<Finding | null> {
        return this.repository.findOne({
            where: { folio, isActive: true },
            relations: ['area', 'machine', 'shift'],
        });
    }

    async findWithFilters(
        filters?: FindingFiltersInput,
        pagination?: FindingPaginationInput,
        sort?: FindingSortInput,
      ): Promise<{ data: Finding[]; total: number }> {
        const qb = this.repository.createQueryBuilder('f')
          .leftJoinAndSelect('f.area', 'area')
          .leftJoinAndSelect('f.machine', 'machine')
          .leftJoinAndSelect('f.shift', 'shift')
          .leftJoinAndSelect('f.converter', 'converter')
          .where('f.is_active = true');
    
        // Aplicar filtros
        if (filters) {
          if (filters.status) {
            qb.andWhere('f.status = :status', { status: filters.status });
          }
          if (filters.areaId) {
            qb.andWhere('f.area_id = :areaId', { areaId: filters.areaId });
          }
          if (filters.shiftId) {
            qb.andWhere('f.shift_id = :shiftId', { shiftId: filters.shiftId });
          }
          if (filters.machineId) {
            qb.andWhere('f.machine_id = :machineId', { machineId: filters.machineId });
          }
          if (filters.createdBy) {
            qb.andWhere('f.created_by = :createdBy', { createdBy: filters.createdBy });
          }
          if (filters.createdFrom) {
            qb.andWhere('f.created_at >= :createdFrom', { createdFrom: filters.createdFrom });
          }
          if (filters.createdTo) {
            qb.andWhere('f.created_at <= :createdTo', { createdTo: filters.createdTo });
          }
          if (filters.search) {
            qb.andWhere('(f.folio ILIKE :search OR f.description ILIKE :search)', {
              search: `%${filters.search}%`,
            });
          }
        }
    
        // Obtener total antes de paginar
        const total = await qb.getCount();
    
        // Aplicar ordenamiento
        const sortField = sort?.field || 'createdAt';
        const sortOrder = sort?.order || 'DESC';
        qb.orderBy(`f.${sortField}`, sortOrder as 'ASC' | 'DESC');
    
        // Aplicar paginación
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        qb.skip((page - 1) * limit).take(limit);
    
        const data = await qb.getMany();
    
        return { data, total };
      }


      async create(data: Partial<Finding>): Promise<Finding> {
        return this.repository.save(this.repository.create(data));
      }

      async update(id: string, data: Partial<Finding>): Promise<Finding | null> {
        const finding = await this.repository.findOne({ where: { id } });
        if (!finding) throw new NotFoundException('Hallazgo no encontrado');
        Object.assign(finding, data);
        return this.repository.save(finding);
      }

      async softDelete(id: string): Promise<void> {
        const finding = await this.repository.findOne({ where: { id } });
        if (!finding) throw new NotFoundException('Hallazgo no encontrado');
        finding.isActive = false;
        finding.deletedAt = new Date();
        await this.repository.save(finding);
      }

      async getStatsByStatus(): Promise<{status: string, count: number}[]> {
        return this.repository.createQueryBuilder('f')
        .select('f.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('f.is_active = true')
        .groupBy('f.status')
        .getRawMany();
      }

      async countOpen(): Promise<number> {
        return this.repository.count({ where: { isActive: true, status: FindingStatus.OPEN } });
      }

      async restore(id: string): Promise<void> {
        const finding = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!finding) throw new NotFoundException('Hallazgo no encontrado');
        finding.isActive = true;
        finding.deletedAt = undefined;
        await this.repository.save(finding);
      }

      getRepository(): Repository<Finding> {
        return this.repository;
      }

}