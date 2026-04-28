import { Injectable, NotFoundException } from '@nestjs/common';
import { SparePartsRepository } from '../../infrastructure/repositories';
import { SparePart } from '../../domain/entities';
import { CreateSparePartInput, UpdateSparePartInput } from '../dto';

@Injectable()
export class SparePartsService {
  constructor(private readonly sparePartsRepository: SparePartsRepository) {}

  async findAll(): Promise<SparePart[]> {
    return this.sparePartsRepository.findAll();
  }

  async findAllActive(): Promise<SparePart[]> {
    return this.sparePartsRepository.findAllActive();
  }

  async findAllWithDeleted(): Promise<SparePart[]> {
    return this.sparePartsRepository.findAllWithDeleted();
  }

  async findById(id: string): Promise<SparePart | null> {
    return this.sparePartsRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<SparePart> {
    const sparePart = await this.sparePartsRepository.findById(id);
    if (!sparePart) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return sparePart;
  }

  async findByMachineId(machineId: string): Promise<SparePart[]> {
    return this.sparePartsRepository.findByMachineId(machineId);
  }

  /**
   * Crea o reutiliza por número de parte. `machineId` y demás campos opcionales
   * solo se aplican al crear; si el registro existe sin máquina y se pasa `machineId`, se actualiza.
   */
  async findOrCreateByPartNumber(
    partNumber: string,
    extra?: Partial<
      Pick<
        SparePart,
        'machineId' | 'description' | 'brand' | 'model' | 'sku' | 'unitOfMeasure'
      >
    >,
  ): Promise<SparePart> {
    const existing =
      await this.sparePartsRepository.findByPartNumberInsensitive(partNumber);
    if (existing) {
      if (extra?.machineId && !existing.machineId) {
        const updated = await this.sparePartsRepository.update(existing.id, {
          machineId: extra.machineId,
        });
        if (updated) return updated;
      }
      return existing;
    }
    return this.sparePartsRepository.create({
      partNumber,
      ...extra,
    });
  }

  async create(input: CreateSparePartInput): Promise<SparePart> {
    return this.sparePartsRepository.create(input);
  }

  async update(
    id: string,
    input: UpdateSparePartInput,
  ): Promise<SparePart | null> {
    await this.findByIdOrFail(id);
    return this.sparePartsRepository.update(id, input);
  }

  async deactivate(id: string) {
    await this.findByIdOrFail(id);
    await this.sparePartsRepository.softDelete(id);
    return this.findByIdOrFail(id);
  }
  async activate(id: string) {
    await this.findByIdOrFail(id);
    await this.sparePartsRepository.restore(id);
    return this.findByIdOrFail(id);
  }
}
