import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { UserRole } from "src/modules/users/domain/entities";

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles: UserRole[];
}
