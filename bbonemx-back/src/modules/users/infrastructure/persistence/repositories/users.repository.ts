import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { User } from "../../../domain/entities";

@Injectable()
export class UsersRepository {
    
    constructor (@InjectRepository(User) private readonly repository: Repository<User>) {}

    async findAll(): Promise<User[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['role', 'department']
        });
    }

    async findAllWithDeleted(): Promise<User[]> {
        return this.repository.find({
            withDeleted: true
        });
    }

    async findByEmployeeNumber(employeeNumber: string): Promise<User | null> {
        return this.repository.findOne({ 
            where: { 
                employeeNumber,
                isActive: true 
            } 
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: {
                id,
                isActive: true
            },
            relations: ['role', 'department']
        });
    }

    async findByIdWithDeleted(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            withDeleted: true
        });
    }

    async existsByEmployeeNumber(employeeNumber: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { employeeNumber }
        });
        return count > 0;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { email }
        });
        return count > 0;
    }

    async existsByEmployeeNumberExcept(employeeNumber: string, excludeUserId: string): Promise<boolean> {
        const count = await this.repository.count({
            where: {
                employeeNumber,
                id: Not(excludeUserId)
            }
        });
        return count > 0;
    }

    async existsByEmailExcept(email: string, excludeUserId: string): Promise<boolean> {
        const count = await this.repository.count({
            where: {
                email,
                id: Not(excludeUserId)
            }
        });
        return count > 0;
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        const savedUser = await this.repository.save(user);
        return this.findById(savedUser.id) as Promise<User>;
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        const user = await this.repository.findOne({ where: { id } });
        if (!user) return null;
        
        
        if (userData.roleId !== undefined) {
            user.role = undefined as any;
        }

        if (userData.departmentId !== undefined) {
            user.department = undefined as any;
        }

        const mergedUser = this.repository.merge(user, userData);
        await this.repository.save(mergedUser);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        const user = await this.repository.findOne({ where: { id } });
        if (!user) return;
        
        user.isActive = false;
        user.deletedAt = new Date();        
        await this.repository.save(user);
    }

    getRepository(): Repository<User> {
        return this.repository;
    }
}