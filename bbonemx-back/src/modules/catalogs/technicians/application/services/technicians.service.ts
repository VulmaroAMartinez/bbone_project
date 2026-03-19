import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TechniciansRepository } from '../../infrastructure/repositories';
import { Technician } from '../../domain/entities';
import { CreateTechnicianInput, UpdateTechnicianInput } from '../dto';
import { UsersRepository } from 'src/modules/users/infrastructure/persistence/repositories';
import { RolesRepository } from 'src/modules/catalogs/roles/infrastructure/repositories';
import { Role as RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class TechniciansService {
  constructor(
    private readonly techniciansRepository: TechniciansRepository,
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async findAll(): Promise<Technician[]> {
    return this.techniciansRepository.findAll();
  }

  async findAllWithDeleted(): Promise<Technician[]> {
    return this.techniciansRepository.findAllWithDeleted();
  }

  async findAllActive(): Promise<Technician[]> {
    return this.techniciansRepository.findAllActive();
  }

  async findById(id: string): Promise<Technician | null> {
    return this.techniciansRepository.findById(id);
  }

  /**
   * Busca un técnico por su ID de técnico o, si no existe, por el ID de usuario.
   * Esto permite que los resolvers acepten indistintamente el id del técnico o del usuario.
   */
  async findByIdOrFail(id: string): Promise<Technician> {
    // Primero intentamos por ID de técnico
    let technician = await this.techniciansRepository.findById(id);

    // Si no existe, intentamos por ID de usuario
    if (!technician) {
      technician = await this.techniciansRepository.findByUserId(id);
    }

    if (!technician) {
      throw new NotFoundException('Técnico no encontrado');
    }

    return technician;
  }

  async create(input: CreateTechnicianInput): Promise<Technician> {
    const existing = await this.techniciansRepository.findByUserId(
      input.userId,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe un técnico asociado a este usuario',
      );
    }
    const technician = await this.techniciansRepository.create({
      userId: input.userId,
      rfc: input.rfc,
      nss: input.nss,
      bloodType: input.bloodType,
      allergies: input.allergies,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      emergencyContactRelationship: input.emergencyContactRelationship,
      birthDate: input.birthDate,
      address: input.address,
      education: input.education,
      childrenCount: input.childrenCount,
      shirtSize: input.shirtSize,
      pantsSize: input.pantsSize,
      shoeSize: input.shoeSize,
      transportRoute: input.transportRoute,
      hireDate: input.hireDate,
      vacationPeriod: input.vacationPeriod,
      positionId: input.positionId,
    });

    if (input.isBoss !== undefined) {
      await this.handleBossRole(input.userId, input.isBoss);
    }

    return technician;
  }

  async update(id: string, input: UpdateTechnicianInput): Promise<Technician> {
    const technician = await this.findByIdOrFail(id);

    const { id: _id, isBoss, ...rest } = input;
    const updateData: Partial<Technician> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        (updateData as Record<string, unknown>)[key] = value;
      }
    }

    const updated = await this.techniciansRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(
        'Técnico no encontrado después de actualizar',
      );
    }

    if (isBoss !== undefined) {
      await this.handleBossRole(technician.userId, isBoss);
    }

    return updated;
  }

  private async handleBossRole(userId: string, isBoss: boolean): Promise<void> {
    const bossRole = await this.rolesRepository.findByName(RoleEnum.BOSS);
    if (!bossRole) return;
    await this.usersRepository.setBossRole(userId, bossRole.id, isBoss);
  }

  async deactivate(id: string): Promise<boolean> {
    // Permite recibir tanto el id del técnico como el id del usuario
    const technician = await this.findByIdOrFail(id);
    await this.techniciansRepository.softDelete(technician.id);
    return true;
  }

  async activate(id: string): Promise<Technician> {
    // Permite recibir tanto el id del técnico como el id del usuario
    const technician = await this.findByIdOrFail(id);
    await this.techniciansRepository.restore(technician.id);
    return this.findByIdOrFail(technician.id);
  }
}
