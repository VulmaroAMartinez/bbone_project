import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialRequest, MaterialRequestMachine } from '../../domain/entities';
import { FolioGenerator } from 'src/common';

const RELATIONS = [
  'requester',
  'machines',
  'machines.machine',
  'machines.machine.area',
  'machines.machine.subArea',
  'machines.machine.subArea.area',
  'items',
  'items.material',
  'items.sparePart',
  'histories',
];

@Injectable()
export class MaterialRequestsRepository {
  constructor(
    @InjectRepository(MaterialRequest)
    private readonly repository: Repository<MaterialRequest>,
    @InjectRepository(MaterialRequestMachine)
    private readonly machineRepository: Repository<MaterialRequestMachine>,
  ) {}

  async findAll(): Promise<MaterialRequest[]> {
    return this.repository.find({
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithDeleted(): Promise<MaterialRequest[]> {
    return this.repository.find({
      withDeleted: true,
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<MaterialRequest[]> {
    return this.repository.find({
      where: { isActive: true },
      withDeleted: true,
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<MaterialRequest | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: RELATIONS,
    });
  }

  async findByFolio(folio: string): Promise<MaterialRequest | null> {
    return this.repository.findOne({
      where: { folio },
      withDeleted: true,
      relations: RELATIONS,
    });
  }

  async findByMachineId(machineId: string): Promise<MaterialRequest[]> {
    const ids = await this.repository
      .createQueryBuilder('mr')
      .innerJoin('mr.machines', 'mrm', 'mrm.machineId = :machineId', {
        machineId,
      })
      .where('mr.isActive = :active', { active: true })
      .select('mr.id')
      .getMany();

    if (ids.length === 0) return [];

    return this.repository.find({
      where: ids.map((r) => ({ id: r.id })),
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<MaterialRequest>): Promise<MaterialRequest> {
    const result = await this.repository.query(
      `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq FROM material_requests`,
    );
    const sequence = Number(result[0].next_seq);
    const folio = FolioGenerator.generateMaterialRequestFolio(
      sequence,
      new Date(),
    );
    const entity = this.repository.create({ ...data, sequence, folio });
    const saved = await this.repository.save(entity);
    return (await this.findById(saved.id))!;
  }

  async update(
    id: string,
    data: Partial<MaterialRequest>,
  ): Promise<MaterialRequest | null> {
    const materialRequest = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!materialRequest) return null;

    const { machines: newMachines, ...rest } = data;
    Object.assign(materialRequest, rest);
    await this.repository.save(materialRequest);

    // Replace machines if provided
    if (newMachines) {
      await this.machineRepository.delete({ materialRequestId: id });
      const entries = newMachines.map((m) =>
        this.machineRepository.create({ materialRequestId: id, machineId: m.machineId }),
      );
      await this.machineRepository.save(entries);
    }

    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    const materialRequest = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!materialRequest) return;
    materialRequest.isActive = false;
    materialRequest.deletedAt = new Date();
    await this.repository.save(materialRequest);
  }
}
