import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OvertimeRepository } from '../../infrastructure/repositories';
import { TechniciansService } from 'src/modules/catalogs/technicians/application/services';
import { CreateOvertimeInput, UpdateOvertimeInput } from '../dto';
import { Overtime } from '../../domain/entities';
import { User } from 'src/modules/users/domain/entities';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';

@Injectable()
export class OvertimeService {
  constructor(
    private readonly overtimeRepository: OvertimeRepository,
    private readonly techniciansService: TechniciansService,
  ) {}

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    technicianId?: string;
    positionId?: string;
    reasonForPayment?: ReasonForPayment;
  }): Promise<Overtime[]> {
    return this.overtimeRepository.findAll(filters);
  }

  async findMyRecords(userId: string): Promise<Overtime[]> {
    const technician = await this.techniciansService.findByIdOrFail(userId);
    return this.overtimeRepository.findByTechnicianId(technician.id);
  }

  async findById(id: string): Promise<Overtime> {
    const record = await this.overtimeRepository.findById(id);
    if (!record)
      throw new NotFoundException(
        `Registro de horas extra con ID ${id} no encontrado`,
      );
    return record;
  }

  private async resolveTechnicianId(
    user: User,
    inputTechnicianId?: string,
  ): Promise<string> {
    // Si viene technicianId en el input → flujo admin (crear para otro técnico)
    if (inputTechnicianId) {
      return inputTechnicianId;
    }
    // Si no viene → buscar el técnico del usuario actual
    const technician = await this.techniciansService.findByIdOrFail(user.id);
    return technician.id;
  }

  async create(input: CreateOvertimeInput, user: User): Promise<Overtime> {
    const isAdmin = user.isAdmin();
    const technicianId = await this.resolveTechnicianId(
      user,
      input.technicianId,
    );

    const data: Partial<Overtime> = {
      workDate: new Date(input.workDate),
      startTime: input.startTime,
      endTime: input.endTime,
      activity: input.activity,
      technicianId,
    };

    if (isAdmin && input.reasonForPayment) {
      data.reasonForPayment = input.reasonForPayment;
    }

    return this.overtimeRepository.create(data);
  }

  async update(input: UpdateOvertimeInput, user: User): Promise<Overtime> {
    const record = await this.findById(input.id);
    const isAdmin = user.isAdmin();

    if (!isAdmin) {
      const technician = await this.techniciansService.findByIdOrFail(user.id);
      if (record.technicianId !== technician.id) {
        throw new ForbiddenException(
          'No tienes permiso para editar este registro',
        );
      }
      if (record.reasonForPayment != null) {
        throw new ForbiddenException(
          'No puedes editar un registro que ya tiene razón de pago asignada',
        );
      }
    }

    const data: Partial<Overtime> = {};
    if (input.workDate) data.workDate = new Date(input.workDate);
    if (input.startTime) data.startTime = input.startTime;
    if (input.endTime) data.endTime = input.endTime;
    if (input.activity !== undefined) data.activity = input.activity;
    if (isAdmin && input.reasonForPayment !== undefined) {
      data.reasonForPayment = input.reasonForPayment;
    }

    const updated = await this.overtimeRepository.update(input.id, data);
    if (!updated)
      throw new NotFoundException(`Registro con ID ${input.id} no encontrado`);
    return updated;
  }

  async delete(id: string, user: User): Promise<boolean> {
    const record = await this.findById(id);
    const isAdmin = user.isAdmin();

    if (!isAdmin) {
      const technician = await this.techniciansService.findByIdOrFail(user.id);
      if (record.technicianId !== technician.id) {
        throw new ForbiddenException(
          'No tienes permiso para eliminar este registro',
        );
      }
      if (record.reasonForPayment != null) {
        throw new ForbiddenException(
          'No puedes eliminar un registro que ya tiene razón de pago asignada',
        );
      }
    }

    await this.overtimeRepository.softDelete(id);
    return true;
  }
}
