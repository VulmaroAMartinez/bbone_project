import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SubAreasRepository } from '../../infrastructure/repositories';
import { SubArea } from '../../domain/entities';
import { CreateSubAreaInput, UpdateSubAreaInput } from '../dto';
import { AreasService } from 'src/modules/catalogs/areas/application/services';
import { AreaType } from 'src/common';

const AREA_TYPES_WITH_SUBAREAS = [
  AreaType.OPERATIONAL,
  AreaType.PRODUCTION,
  AreaType.SERVICE,
];

@Injectable()
export class SubAreasService {
  constructor(
    private readonly subAreasRepository: SubAreasRepository,
    private readonly areasService: AreasService,
  ) {}

  async findAll(): Promise<SubArea[]> {
    return this.subAreasRepository.findAll();
  }

  async findAllWithDeleted(): Promise<SubArea[]> {
    return this.subAreasRepository.findAllWithDeleted();
  }

  async findAllActive(): Promise<SubArea[]> {
    return this.subAreasRepository.findAllActive();
  }

  async findById(id: string): Promise<SubArea | null> {
    return this.subAreasRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<SubArea> {
    const subArea = await this.subAreasRepository.findById(id);
    if (!subArea) {
      throw new NotFoundException(`Sub-área con ID ${id} no encontrada`);
    }
    return subArea;
  }

  async findByAreaId(areaId: string): Promise<SubArea[]> {
    return this.subAreasRepository.findByAreaId(areaId);
  }

  async create(input: CreateSubAreaInput): Promise<SubArea> {
    const area = await this.areasService.findByIdOrFail(input.areaId);
    if (!AREA_TYPES_WITH_SUBAREAS.includes(area.type)) {
      throw new BadRequestException(
        `El área "${area.name}" es de tipo ${area.type} y no admite sub-áreas.`,
      );
    }
    return this.subAreasRepository.create(input);
  }

  async update(id: string, input: UpdateSubAreaInput): Promise<SubArea | null> {
    await this.findByIdOrFail(id);
    if (input.areaId) {
      const area = await this.areasService.findByIdOrFail(input.areaId);
      if (!AREA_TYPES_WITH_SUBAREAS.includes(area.type)) {
        throw new BadRequestException(
          `El área seleccionada es de tipo ${area.type} y no admite sub-áreas.`,
        );
      }
    }
    return this.subAreasRepository.update(id, input);
  }

  async deactivate(id: string) {
    await this.findByIdOrFail(id);
    await this.subAreasRepository.softDelete(id);
    return this.findByIdOrFail(id);
  }
  async activate(id: string) {
    await this.findByIdOrFail(id);
    await this.subAreasRepository.restore(id);
    return this.findByIdOrFail(id);
  }
}
