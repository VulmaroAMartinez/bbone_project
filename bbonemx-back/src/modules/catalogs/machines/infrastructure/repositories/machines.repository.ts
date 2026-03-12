import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Machine } from "../../domain/entities";

@Injectable()
export class MachinesRepository {
    constructor(@InjectRepository(Machine) private readonly repository: Repository<Machine>) {}

    private readonly BASE_RELATIONS = ['area', 'subArea', 'subArea.area'];

    async findAll(): Promise<Machine[]> {
        return this.repository.find({ relations: this.BASE_RELATIONS, order: { name: 'ASC' } });
    }

    async findAllWithDeleted(): Promise<Machine[]> {
        return this.repository.find({ withDeleted: true, relations: this.BASE_RELATIONS, order: { name: 'ASC' } });
    }

    async findAllActive(): Promise<Machine[]> {
        return this.repository.find({ where: { isActive: true }, withDeleted: true, relations: this.BASE_RELATIONS, order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Machine | null> {
        return this.repository.findOne({ where: { id }, withDeleted: true, relations: this.BASE_RELATIONS });
    }

    async findBySubAreaId(subAreaId: string): Promise<Machine[]> {
        return this.repository.find({ where: { subAreaId, isActive: true }, withDeleted: true, relations: this.BASE_RELATIONS, order: { name: 'ASC' } });
    }

    
    async findByAreaId(areaId: string): Promise<Machine[]> {
        return this.repository.find({
            where: { areaId, isActive: true },
            withDeleted: true,
            relations: this.BASE_RELATIONS,
            order: { name: 'ASC' },
        });
    }

    /**
     * Búsqueda flexible: retorna máquinas activas filtradas por área y/o sub-área.
     * - Solo areaId: retorna máquinas directas del área + máquinas de sus sub-áreas.
     * - areaId + subAreaId: retorna solo máquinas de esa sub-área.
     * - Solo subAreaId: retorna máquinas de esa sub-área.
     */
    async findByAreaOrSubArea(areaId?: string, subAreaId?: string): Promise<Machine[]> {
        const qb = this.repository.createQueryBuilder('m')
            .leftJoinAndSelect('m.area', 'area')
            .leftJoinAndSelect('m.subArea', 'subArea')
            .leftJoinAndSelect('subArea.area', 'subAreaParent')
            .where('m.is_active = true')
            .orderBy('m.name', 'ASC');

        if (subAreaId) {
            // Filtro específico por sub-área
            qb.andWhere('m.sub_area_id = :subAreaId', { subAreaId });
        } else if (areaId) {
            // Máquinas directas del área + máquinas de sub-áreas del área
            qb.andWhere(
                '(m.area_id = :areaId OR m.sub_area_id IN (SELECT sa.id FROM sub_areas sa WHERE sa.area_id = :areaId AND sa.is_active = true))',
                { areaId },
            );
        }

        return qb.getMany();
    }

    async create(data: Partial<Machine>): Promise<Machine> {
        const created = await this.repository.save(this.repository.create(data));
        return (await this.findById(created.id)) ?? created;
    }

    async update(id: string, data: Partial<Machine>): Promise<Machine | null> {
        const machine = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!machine) return null;
        Object.assign(machine, data);
        const updated = await this.repository.save(machine);
        return (await this.findById(updated.id)) ?? updated;
    }

    async softDelete(id: string): Promise<void> {
        const machine = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!machine) return;
        machine.isActive = false;
        machine.deletedAt = new Date();
        await this.repository.save(machine);
    }

    async restore(id: string): Promise<void> {
        const machine = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!machine) return;
        machine.isActive = true;
        machine.deletedAt = null;
        await this.repository.save(machine);
    }
}
