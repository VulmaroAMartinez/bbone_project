import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../../domain/entities";

@Injectable()
export class RolesRepository {
    constructor(@InjectRepository(Role) private readonly repository: Repository<Role>) { }

    findAll = () => this.repository.find({ order: { name: 'ASC' } });
    findAllActive = () => this.repository.find({ where: { isActive: true }, order: { name: 'ASC' } });
    findById = (id: string) => this.repository.findOne({ where: { id, isActive: true } });
    findByName = (name: string) => this.repository.findOne({ where: { name, isActive: true } });
    async create(data: Partial<Role>) {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<Role>): Promise<Role | null> {
        // Cargar la entidad para que los subscribers se disparen
        const role = await this.repository.findOne({ where: { id } });
        if (!role) return null;
        
        // Asignar los nuevos valores
        Object.assign(role, data);
        
        // save() dispara los subscribers (auditoría)
        await this.repository.save(role);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        // Cargar la entidad para que los subscribers se disparen
        const role = await this.repository.findOne({ where: { id } });
        if (!role) return;
        
        role.isActive = false;
        role.deletedAt = new Date();
        
        // save() dispara los subscribers (auditoría)
        await this.repository.save(role);
    }

    async restore(id: string): Promise<void> {
        // Cargar la entidad para que los subscribers se disparen
        const role = await this.repository.findOne({ 
            where: { id },
            withDeleted: true 
        });
        if (!role) return;
        
        role.isActive = true;
        role.deletedAt = undefined;
        
        // save() dispara los subscribers (auditoría)
        await this.repository.save(role);
    }
}