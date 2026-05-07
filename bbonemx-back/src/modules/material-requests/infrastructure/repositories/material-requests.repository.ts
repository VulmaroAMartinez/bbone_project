import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
  'photos',
];

/** Advisory lock key serializing sequence assignment across create/hardDelete. */
const MATERIAL_REQUESTS_SEQ_LOCK = 987654322;

@Injectable()
export class MaterialRequestsRepository {
  constructor(
    @InjectRepository(MaterialRequest)
    private readonly repository: Repository<MaterialRequest>,
    @InjectRepository(MaterialRequestMachine)
    private readonly machineRepository: Repository<MaterialRequestMachine>,
    private readonly dataSource: DataSource,
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

  /**
   * Solicitudes donde el usuario es solicitante o figura como jefe a cargo (campo `boss` = fullName).
   */
  async findAllWithDeletedForBossScope(
    requesterId: string,
    bossFullName: string,
  ): Promise<MaterialRequest[]> {
    const idsRaw = await this.repository
      .createQueryBuilder('mr')
      .withDeleted()
      .select('mr.id', 'id')
      .where(
        '(mr.requester_id = :requesterId OR LOWER(TRIM(mr.boss)) = LOWER(TRIM(:bossName)))',
        { requesterId, bossName: bossFullName },
      )
      .orderBy('mr.created_at', 'DESC')
      .getRawMany<{ id: string }>();

    if (idsRaw.length === 0) return [];

    const ids = idsRaw.map((r) => r.id);
    const rows = await this.repository.find({
      where: { id: In(ids) },
      withDeleted: true,
      relations: RELATIONS,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids
      .map((id) => byId.get(id))
      .filter((r): r is MaterialRequest => r != null);
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
    const saved = await this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        MATERIAL_REQUESTS_SEQ_LOCK,
      ]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await manager.query(
        `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq FROM material_requests`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sequence = Number(result[0].next_seq);
      const folio = FolioGenerator.generateMaterialRequestFolio(
        sequence,
        new Date(),
      );
      const entity = this.repository.create({ ...data, sequence, folio });
      return manager.save(entity);
    });
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
        this.machineRepository.create({
          materialRequestId: id,
          machineId: m.machineId ?? undefined,
          customMachineName: m.customMachineName ?? undefined,
          customMachineModel: m.customMachineModel ?? undefined,
          customMachineManufacturer: m.customMachineManufacturer ?? undefined,
          customMachineArea: m.customMachineArea ?? undefined,
        }),
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

  /**
   * Physically removes a material request and all its child rows
   * (photos, history, items, machines), then re-sequences folios of all
   * subsequent material requests so the PLT-YYMMDD-NNN sequence remains
   * gap-free.
   *
   * Returns the file paths of photos that should be deleted from disk by
   * the caller (after the transaction commits).
   */
  async hardDelete(id: string): Promise<string[]> {
    let filePaths: string[] = [];

    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        MATERIAL_REQUESTS_SEQ_LOCK,
      ]);

      type RequestRow = { id: string; sequence: number };
      type PhotoRow = { file_path: string };
      type AffectedRow = { id: string; sequence: number; created_at: string };

      const rows = (await manager.query(
        `SELECT id, sequence FROM material_requests WHERE id = $1`,
        [id],
      )) as unknown as RequestRow[];
      const [row] = rows;

      if (!row) {
        throw new NotFoundException(
          `Solicitud de material con ID ${id} no encontrada`,
        );
      }

      const deletedSeq: number = row.sequence;

      const photos = (await manager.query(
        `SELECT file_path FROM material_request_photos WHERE material_request_id = $1`,
        [id],
      )) as unknown as PhotoRow[];
      filePaths = photos.map((p) => p.file_path).filter(Boolean);

      // Borrado explícito de hijos en orden, defensivo respecto al DDL real
      // (MaterialRequestHistory NO declara onDelete: 'CASCADE' en TypeORM).
      await manager.query(
        `DELETE FROM material_request_photos WHERE material_request_id = $1`,
        [id],
      );
      await manager.query(
        `DELETE FROM material_request_history WHERE material_request_id = $1`,
        [id],
      );
      await manager.query(
        `DELETE FROM material_request_items WHERE material_request_id = $1`,
        [id],
      );
      await manager.query(
        `DELETE FROM material_request_machines WHERE material_request_id = $1`,
        [id],
      );
      await manager.query(`DELETE FROM material_requests WHERE id = $1`, [id]);

      const affected = (await manager.query(
        `SELECT id, sequence, created_at FROM material_requests WHERE sequence > $1 ORDER BY sequence ASC`,
        [deletedSeq],
      )) as unknown as AffectedRow[];

      for (const affectedRow of affected) {
        const newSeq = affectedRow.sequence - 1;
        const newFolio = FolioGenerator.generateMaterialRequestFolio(
          newSeq,
          new Date(affectedRow.created_at),
        );
        await manager.query(
          `UPDATE material_requests SET sequence = $1, folio = $2 WHERE id = $3`,
          [newSeq, newFolio, affectedRow.id],
        );
      }
    });

    return filePaths;
  }
}
