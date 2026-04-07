import {
  Entity,
  Index,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../../infrastructure/database/base.entity';
import { Role } from '../../../catalogs/roles/domain/entities';
import { Department } from '../../../catalogs/departments/domain/entities';
import { UserRole } from './user-role.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Index({ unique: true })
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
    nullable: true,
  })
  email?: string;

  @Column({
    type: 'varchar',
    length: 13,
    nullable: true,
  })
  phone?: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user, {
    cascade: true,
  })
  userRoles: UserRole[];

  get roles(): Role[] {
    return (
      this.userRoles
        ?.filter((ur) => ur.isActive)
        .map((userRole) => userRole.role)
        .filter(Boolean) ?? []
    );
  }

  set roles(roles: Role[]) {
    this.userRoles =
      roles?.map((role) => {
        const userRole = new UserRole();
        userRole.user = this;
        userRole.role = role;
        userRole.roleId = role.id;
        return userRole;
      }) ?? [];
  }

  get roleIds(): string[] {
    return this.roles.map((role) => role.id);
  }

  get role(): Role | undefined {
    return this.roles[0];
  }

  get roleId(): string | undefined {
    return this.role?.id;
  }

  @Column({
    name: 'department_id',
    type: 'uuid',
  })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasRole(roleName: string): boolean {
    return (
      this.roles?.some((role) => role.name === roleName) ??
      this.role?.name === roleName
    );
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
  isTechnician(): boolean {
    return this.hasRole('TECHNICIAN');
  }
  isRequester(): boolean {
    return this.hasRole('REQUESTER');
  }
  isBoss(): boolean {
    return this.hasRole('BOSS');
  }
}
