import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { RolesRepository } from "../../infrastructure/repositories";
import { Role } from "../../domain/entities";
import { CreateRoleInput, UpdateRoleInput } from "../dto";

/**
 * Servicio de gestión de roles.
 * 
 * NOTA: Los campos de auditoría (createdBy, updatedBy) se asignan
 * automáticamente mediante el BaseEntitySubscriber usando el contexto
 * del usuario actual (AsyncLocalStorage). No es necesario pasarlos manualmente.
 */
@Injectable()
export class RolesService {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async findAll(): Promise<Role[]> {
        return this.rolesRepository.findAll();
    }

    async findAllActive(): Promise<Role[]> {
        return this.rolesRepository.findAllActive();
    }

    async findById(id: string): Promise<Role | null> {
        return this.rolesRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Role> {
        const role = await this.rolesRepository.findById(id);
        if(!role) throw new NotFoundException('Rol no encontrado');
        return role;
    }

    /**
     * Crea un nuevo rol.
     * El createdBy se asigna automáticamente desde el contexto del usuario.
     */
    async create(input: CreateRoleInput): Promise<Role> {
        if (await this.rolesRepository.findByName(input.name)) {
          throw new ConflictException(`Ya existe un rol con el nombre "${input.name}"`);
        }
        return this.rolesRepository.create(input);
    }

    /**
     * Actualiza un rol existente.
     * El updatedBy se asigna automáticamente desde el contexto del usuario.
     */
    async update(id: string, input: UpdateRoleInput): Promise<Role> {
        await this.findByIdOrFail(id);
        
        // Verificar nombre duplicado si se está cambiando
        if (input.name) {
            const existingRole = await this.rolesRepository.findByName(input.name);
            if (existingRole && existingRole.id !== id) {
                throw new ConflictException(`Ya existe un rol con el nombre "${input.name}"`);
            }
        }
        
        const updatedRole = await this.rolesRepository.update(id, input);
        if (!updatedRole) {
            throw new NotFoundException('Rol no encontrado después de actualizar');
        }
        return updatedRole;
    }

    /**
     * Elimina (soft delete) un rol.
     */
    async deactivate(id: string): Promise<boolean> {
        await this.findByIdOrFail(id);
        await this.rolesRepository.softDelete(id);
        return true;
    }

    /**
     * Restaura un rol eliminado.
     */
    async activate(id: string): Promise<Role> {
        await this.rolesRepository.restore(id);
        return this.findByIdOrFail(id);
    }
}