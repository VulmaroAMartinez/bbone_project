import { Entity, Index, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { Role } from 'src/modules/catalogs/roles/domain/entities';
import { Department } from 'src/modules/catalogs/departments/domain/entities';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @Index({unique: true})
    @Column({
        name: 'employee_number',
        type: 'varchar',
        unique: true,
    })
    employeeNumber: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    password: string;

    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 100,
    })
    firstName: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 100,
    })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: true
    })
    email?: string;

    @Column({
        type: 'varchar',
        length: 13,
        nullable: true
    })
    phone?: string;

    @Column({name: 'role_id', type: 'uuid'})
    roleId: string;

    @ManyToOne(() => Role, {eager: true})
    @JoinColumn({name: 'role_id'})
    role: Role;

    @Column({name: 'department_id', type: 'uuid'})
    departmentId: string;

    @ManyToOne(() => Department)
    @JoinColumn({name: 'department_id'})
    department: Department;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    hasRole(roleName: string): boolean {
        return this.role?.name === roleName;
    }

    isAdmin(): boolean {
        return this.role?.name === 'ADMIN';
    }

    isTechnician(): boolean {
        return this.role?.name === 'TECHNICIAN';
    }

    isRequester(): boolean {
        return this.role?.name === 'REQUESTER';
    }
}