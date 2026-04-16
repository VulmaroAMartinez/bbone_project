import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/persistence/repositories';
import { User } from '../../domain/entities';
import { PasswordService } from 'src/common/services';
import { CreateUserInput, UpdateUserInput } from '../dto';
import { RolesRepository } from 'src/modules/catalogs/roles/infrastructure/repositories';
import { DepartmentsRepository } from 'src/modules/catalogs/departments/infrastructure/repositories';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly rolesRepository: RolesRepository,
    private readonly departmentsRepository: DepartmentsRepository,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findAllWithDeleted(): Promise<User[]> {
    return this.usersRepository.findAllWithDeleted();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<User | null> {
    return this.usersRepository.findByEmployeeNumber(employeeNumber);
  }

  async existsByEmployeeNumber(employeeNumber: string): Promise<boolean> {
    return this.usersRepository.existsByEmployeeNumber(employeeNumber);
  }

  async create(input: CreateUserInput): Promise<User> {
    const existsEmployeeNumber =
      await this.usersRepository.existsByEmployeeNumber(input.employeeNumber);
    if (existsEmployeeNumber) {
      throw new ConflictException(
        `Ya existe un usuario con el número de empleado ${input.employeeNumber}`,
      );
    }

    if (input.email) {
      const existsEmail = await this.usersRepository.existsByEmail(input.email);
      if (existsEmail) {
        throw new ConflictException(
          `Ya existe un usuario con el correo ${input.email}`,
        );
      }
    }

    const roleIds = [...new Set(input.roleIds)];
    const roles = await this.rolesRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Uno o más roles no existen');
    }

    const department = await this.departmentsRepository.findById(
      input.departmentId,
    );
    if (!department) {
      throw new BadRequestException(
        `Departamento con ID ${input.departmentId} no encontrado`,
      );
    }

    const hashedPassword = await this.passwordService.hash(input.password);

    return this.usersRepository.create({
      employeeNumber: input.employeeNumber,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      roles,
      departmentId: input.departmentId,
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findByIdOrFail(id);

    if (
      input.employeeNumber !== undefined &&
      input.employeeNumber !== user.employeeNumber
    ) {
      const exists = await this.usersRepository.existsByEmployeeNumberExcept(
        input.employeeNumber,
        id,
      );
      if (exists) {
        throw new ConflictException(
          `Ya existe un usuario con el número de empleado ${input.employeeNumber}`,
        );
      }
    }

    if (input.email !== undefined && input.email !== user.email) {
      const exists = await this.usersRepository.existsByEmailExcept(
        input.email,
        id,
      );
      if (exists) {
        throw new ConflictException(
          `Ya existe un usuario con el correo ${input.email}`,
        );
      }
    }

    const nextRoleIds =
      input.roleIds ?? (input.roleId ? [input.roleId] : undefined);

    let rolePatch: Partial<User> = {};
    if (nextRoleIds !== undefined) {
      const uniqueRoleIds = [...new Set(nextRoleIds)];
      if (!uniqueRoleIds.length) {
        throw new BadRequestException('Debe seleccionar al menos un rol');
      }
      const roles = await this.rolesRepository.findByIds(uniqueRoleIds);
      if (roles.length !== uniqueRoleIds.length) {
        throw new BadRequestException('Uno o más roles no existen');
      }
      rolePatch = { roles };
    }

    if (input.departmentId !== undefined) {
      const department = await this.departmentsRepository.findById(
        input.departmentId,
      );
      if (!department) {
        throw new BadRequestException(
          `Departamento con ID ${input.departmentId} no encontrado`,
        );
      }
    }

    const updateData: Partial<User> = {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.employeeNumber !== undefined && {
        employeeNumber: input.employeeNumber,
      }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.departmentId !== undefined && {
        departmentId: input.departmentId,
      }),
      ...(input.areaId !== undefined && { areaId: input.areaId || undefined }),
      ...(input.subAreaId !== undefined && {
        subAreaId: input.subAreaId || undefined,
      }),
      ...rolePatch,
    };

    if (input.password) {
      updateData.password = await this.passwordService.hash(input.password);
    }

    const updated = await this.usersRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return updated;
  }

  async deactivate(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.usersRepository.softDelete(id);
  }

  async activate(id: string): Promise<User> {
    const existing = await this.usersRepository.findByIdWithDeleted(id);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    await this.usersRepository.restore(id);
    const restored = await this.usersRepository.findByIdWithDeleted(id);
    if (!restored) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return restored;
  }
}
