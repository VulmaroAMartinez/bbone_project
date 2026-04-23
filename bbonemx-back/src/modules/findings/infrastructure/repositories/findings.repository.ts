import { Injectable, NotFoundException } from '@nestjs/common';
import { Finding } from '../../domain/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FindingStatus, FolioGenerator } from 'src/common';
import {
  FindingFiltersInput,
  FindingPaginationInput,
  FindingSortInput,
} from '../../application/dto';

/** Advisory lock key serializing sequence assignment across create/hardDelete. */
const FINDINGS_SEQ_LOCK = 987654321;

@Injectable()
export class FindingsRepository {
  constructor(
    @InjectRepository(Finding)
    private readonly repository: Repository<Finding>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Finding[]> {
    return this.repository.find({
      where: { isActive: true },
      withDeleted: true,
      relations: ['area', 'machine', 'shift', 'converter'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllWithDeleted(): Promise<Finding[]> {
    return this.repository.find({
      withDeleted: true,
      relations: ['area', 'machine', 'shift', 'converter'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllOpen(): Promise<Finding[]> {
    return this.repository.find({
      where: { isActive: true, status: FindingStatus.OPEN },
      withDeleted: true,
      relations: ['area', 'machine', 'shift'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Finding | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['area', 'machine', 'shift', 'converter'],
    });
  }

  async findByCreatedBy(createdBy: string): Promise<Finding[]> {
    return this.repository.find({
      where: { createdBy, isActive: true },
      withDeleted: true,
      relations: ['area', 'machine', 'shift'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByAreaId(areaId: string): Promise<Finding[]> {
    return this.repository.find({
      where: { areaId, isActive: true },
      withDeleted: true,
      relations: ['area', 'machine', 'shift'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByShiftId(shiftId: string): Promise<Finding[]> {
    return this.repository.find({
      where: { shiftId, isActive: true },
      withDeleted: true,
      relations: ['area', 'machine', 'shift'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByFolio(folio: string): Promise<Finding | null> {
    return this.repository.findOne({
      where: { folio, isActive: true },
      withDeleted: true,
      relations: ['area', 'machine', 'shift'],
    });
  }

  async findWithFilters(
    filters?: FindingFiltersInput,
    pagination?: FindingPaginationInput,
    sort?: FindingSortInput,
  ): Promise<{ data: Finding[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.area', 'area')
      .leftJoinAndSelect('f.machine', 'machine')
      .leftJoinAndSelect('f.shift', 'shift')
      .leftJoinAndSelect('f.converter', 'converter')
      .where('f.is_active = true');

    // Aplicar filtros
    if (filters) {
      if (filters.status) {
        qb.andWhere('f.status = :status', { status: filters.status });
      }
      if (filters.areaId) {
        qb.andWhere('f.area_id = :areaId', { areaId: filters.areaId });
      }
      if (filters.shiftId) {
        qb.andWhere('f.shift_id = :shiftId', { shiftId: filters.shiftId });
      }
      if (filters.machineId) {
        qb.andWhere('f.machine_id = :machineId', {
          machineId: filters.machineId,
        });
      }
      if (filters.createdBy) {
        qb.andWhere('f.created_by = :createdBy', {
          createdBy: filters.createdBy,
        });
      }
      if (filters.createdFrom) {
        qb.andWhere('f.created_at >= :createdFrom', {
          createdFrom: filters.createdFrom,
        });
      }
      if (filters.createdTo) {
        qb.andWhere('f.created_at <= :createdTo', {
          createdTo: filters.createdTo,
        });
      }
      if (filters.search) {
        qb.andWhere('(f.folio ILIKE :search OR f.description ILIKE :search)', {
          search: `%${filters.search}%`,
        });
      }
      if (filters.collection) {
        qb.andWhere('f.collection ILIKE :collection', {
          collection: `%${filters.collection}%`,
        });
      }
    }

    // Obtener total antes de paginar
    const total = await qb.getCount();

    // Aplicar ordenamiento
    const sortField = sort?.field || 'createdAt';
    const sortOrder = sort?.order || 'DESC';
    qb.orderBy(`f.${sortField}`, sortOrder);

    // Aplicar paginación
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getMany();

    return { data, total };
  }

  async create(data: Partial<Finding>): Promise<Finding> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        FINDINGS_SEQ_LOCK,
      ]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await manager.query(
        `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq FROM findings`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sequence = Number(result[0].next_seq);
      const folio = FolioGenerator.generateFindingFolio(sequence, new Date());
      const entity = this.repository.create({ ...data, sequence, folio });
      return manager.save(entity);
    });
  }

  async update(id: string, data: Partial<Finding>): Promise<Finding | null> {
    const finding = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!finding) throw new NotFoundException('Hallazgo no encontrado');
    Object.assign(finding, data);
    return this.repository.save(finding);
  }

  /**
   * Physically removes a finding and re-sequences folios of all subsequent findings.
   * Returns the file paths of photos that should be deleted from disk by the caller.
   */
  async hardDelete(id: string): Promise<string[]> {
    let filePaths: string[] = [];

    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        FINDINGS_SEQ_LOCK,
      ]);

      type FindingRow = {
        id: string;
        sequence: number;
        photo_path?: string | null;
      };
      type PhotoRow = { file_path: string };
      type AffectedRow = { id: string; sequence: number; created_at: string };

      const findingRows = (await manager.query(
        `SELECT id, sequence, photo_path FROM findings WHERE id = $1`,
        [id],
      )) as unknown as FindingRow[];
      const [finding] = findingRows;

      if (!finding) throw new NotFoundException('Hallazgo no encontrado');

      const deletedSeq: number = finding.sequence;

      const photos = (await manager.query(
        `SELECT file_path FROM finding_photos WHERE finding_id = $1`,
        [id],
      )) as unknown as PhotoRow[];
      filePaths = photos.map((p) => p.file_path).filter(Boolean);
      const primaryPhoto = finding.photo_path?.trim();
      if (primaryPhoto && !filePaths.includes(primaryPhoto)) {
        filePaths.push(primaryPhoto);
      }

      await manager.query(`DELETE FROM findings WHERE id = $1`, [id]);

      const affected = (await manager.query(
        `SELECT id, sequence, created_at FROM findings WHERE sequence > $1 ORDER BY sequence ASC`,
        [deletedSeq],
      )) as unknown as AffectedRow[];

      for (const row of affected) {
        const newSeq = row.sequence - 1;
        const newFolio = FolioGenerator.generateFindingFolio(
          newSeq,
          new Date(row.created_at),
        );
        await manager.query(
          `UPDATE findings SET sequence = $1, folio = $2 WHERE id = $3`,
          [newSeq, newFolio, row.id],
        );
      }
    });

    return filePaths;
  }

  async softDelete(id: string): Promise<void> {
    const finding = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!finding) throw new NotFoundException('Hallazgo no encontrado');
    finding.isActive = false;
    finding.deletedAt = new Date();
    await this.repository.save(finding);
  }

  async getStatsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.repository
      .createQueryBuilder('f')
      .select('f.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('f.is_active = true')
      .groupBy('f.status')
      .getRawMany();
  }

  async countOpen(): Promise<number> {
    return this.repository.count({
      where: { isActive: true, status: FindingStatus.OPEN },
      withDeleted: true,
    });
  }

  async restore(id: string): Promise<void> {
    const finding = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!finding) throw new NotFoundException('Hallazgo no encontrado');
    finding.isActive = true;
    finding.deletedAt = null;
    await this.repository.save(finding);
  }

  async findCountByDate(date: string): Promise<number> {
    return this.repository
      .createQueryBuilder('f')
      .where('f.is_active = true')
      .andWhere('DATE(f.created_at) = :date', { date })
      .getCount();
  }

  async assignCollectionByDate(
    date: string,
    collection: string,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Finding)
      .set({ collection })
      .where('is_active = true')
      .andWhere('DATE(created_at) = :date', { date })
      .execute();
    return result.affected ?? 0;
  }

  async findAllForExport(filters?: FindingFiltersInput): Promise<Finding[]> {
    const qb = this.repository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.area', 'area')
      .leftJoinAndSelect('f.machine', 'machine')
      .leftJoinAndSelect('f.photos', 'photos')
      .where('f.is_active = true');

    if (filters) {
      if (filters.status) {
        qb.andWhere('f.status = :status', { status: filters.status });
      }
      if (filters.areaId) {
        qb.andWhere('f.area_id = :areaId', { areaId: filters.areaId });
      }
      if (filters.shiftId) {
        qb.andWhere('f.shift_id = :shiftId', { shiftId: filters.shiftId });
      }
      if (filters.machineId) {
        qb.andWhere('f.machine_id = :machineId', {
          machineId: filters.machineId,
        });
      }
      if (filters.createdBy) {
        qb.andWhere('f.created_by = :createdBy', {
          createdBy: filters.createdBy,
        });
      }
      if (filters.createdFrom) {
        qb.andWhere('f.created_at >= :createdFrom', {
          createdFrom: filters.createdFrom,
        });
      }
      if (filters.createdTo) {
        qb.andWhere('f.created_at <= :createdTo', {
          createdTo: filters.createdTo,
        });
      }
      if (filters.search) {
        qb.andWhere('(f.folio ILIKE :search OR f.description ILIKE :search)', {
          search: `%${filters.search}%`,
        });
      }
      if (filters.collection) {
        qb.andWhere('f.collection ILIKE :collection', {
          collection: `%${filters.collection}%`,
        });
      }
    }

    qb.orderBy('f.created_at', 'DESC');
    return qb.getMany();
  }

  getRepository(): Repository<Finding> {
    return this.repository;
  }
}
