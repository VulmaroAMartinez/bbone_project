import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, UserRole } from '../../../domain/entities';
import { Role } from 'src/modules/catalogs/roles/domain/entities';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['userRoles', 'userRoles.role', 'department'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  async findAllWithDeleted(): Promise<User[]> {
    return this.repository.find({
      withDeleted: true,
      relations: ['userRoles', 'userRoles.role', 'department'],
      order: { isActive: 'DESC', firstName: 'ASC', lastName: 'ASC' },
    });
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<User | null> {
    return this.repository.findOne({
      where: {
        employeeNumber,
        isActive: true,
      },
      relations: ['userRoles', 'userRoles.role', 'department'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: ['userRoles', 'userRoles.role', 'department'],
    });
  }

  async findByIdWithDeleted(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['userRoles', 'userRoles.role', 'department'],
    });
  }

  async existsByEmployeeNumber(employeeNumber: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { employeeNumber },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email },
      withDeleted: true,
    });
    return count > 0;
  }

  async existsByEmployeeNumberExcept(
    employeeNumber: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        employeeNumber,
        id: Not(excludeUserId),
      },
      withDeleted: true,
    });
    return count > 0;
  }

  async existsByEmailExcept(
    email: string,
    excludeUserId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        email,
        id: Not(excludeUserId),
      },
      withDeleted: true,
    });
    return count > 0;
  }

  async create(userData: Partial<User>): Promise<User> {
    const roles: Role[] | undefined = userData.roles;
    const { roles: _roles, ...userDataWithoutRoles } = userData;
    const user = this.repository.create(userDataWithoutRoles);
    const savedUser = await this.repository.save(user);

    if (roles?.length) {
      await this.saveUserRoles(savedUser.id, roles);
    }

    return this.findById(savedUser.id) as Promise<User>;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) return null;

    const roles: Role[] | undefined = userData.roles;
    const { roles: _roles, ...patchWithoutRoles } = userData as any;

    if (patchWithoutRoles.departmentId !== undefined) {
      user.department = undefined as any;
    }

    const mergedUser = this.repository.merge(user, patchWithoutRoles);
    await this.repository.save(mergedUser);

    if (roles !== undefined) {
      await this.saveUserRoles(id, roles);
    }

    return this.findById(id);
  }

  async setBossRole(
    userId: string,
    bossRoleId: string,
    activate: boolean,
  ): Promise<void> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId: bossRoleId },
      withDeleted: true,
    });

    if (activate) {
      if (existing) {
        existing.isActive = true;
        existing.deletedAt = null;
        await this.userRoleRepository.save(existing);
      } else {
        const ur = this.userRoleRepository.create();
        ur.userId = userId;
        ur.roleId = bossRoleId;
        ur.isActive = true;
        await this.userRoleRepository.save(ur);
      }
    } else if (existing && existing.isActive) {
      existing.isActive = false;
      existing.deletedAt = new Date();
      await this.userRoleRepository.save(existing);
    }
  }

  private async saveUserRoles(userId: string, roles: Role[]): Promise<void> {
    await this.userRoleRepository.delete({ userId });
    if (roles.length === 0) return;
    const userRoles = roles.map((role) => {
      const ur = this.userRoleRepository.create();
      ur.userId = userId;
      ur.roleId = role.id;
      return ur;
    });
    await this.userRoleRepository.save(userRoles);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) return;

    user.isActive = false;
    user.deletedAt = new Date();
    await this.repository.save(user);
  }

  async restore(id: string): Promise<void> {
    const user = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) return;

    user.isActive = true;
    user.deletedAt = undefined;
    await this.repository.save(user);
  }

  getRepository(): Repository<User> {
    return this.repository;
  }

  /**
   * Correos de usuarios activos con un rol por nombre (p. ej. ADMIN), sin duplicados.
   */
  async findActiveEmailsByRoleName(roleName: string): Promise<string[]> {
    const rows = await this.repository
      .createQueryBuilder('user')
      .innerJoin(
        'user.userRoles',
        'ur',
        'ur.is_active = :urActive AND ur.deleted_at IS NULL',
        { urActive: true },
      )
      .innerJoin('ur.role', 'role', 'role.name = :roleName', { roleName })
      .where('user.is_active = :uActive', { uActive: true })
      .andWhere('user.email IS NOT NULL')
      .andWhere("NULLIF(TRIM(user.email), '') IS NOT NULL")
      .select('user.email', 'email')
      .distinct(true)
      .getRawMany<{ email: string }>();

    return rows.map((r) => r.email.trim()).filter(Boolean);
  }
}
