import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSparePartMachineIdNullable20260428120000 implements MigrationInterface {
  name = 'MakeSparePartMachineIdNullable20260428120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ALTER COLUMN "machine_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "spare_parts" WHERE "machine_id" IS NULL`,
    )) as Array<{ count: number }>;
    const nullCount = Number(rows[0]?.count ?? 0);

    if (nullCount > 0) {
      throw new Error(
        `Rollback abortado: existen ${nullCount} registros en spare_parts con machine_id NULL.`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "spare_parts" ALTER COLUMN "machine_id" SET NOT NULL`,
    );
  }
}
