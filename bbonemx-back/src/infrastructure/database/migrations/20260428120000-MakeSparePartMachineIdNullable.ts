import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSparePartMachineIdNullable20260428120000
  implements MigrationInterface
{
  name = 'MakeSparePartMachineIdNullable20260428120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ALTER COLUMN "machine_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ALTER COLUMN "machine_id" SET NOT NULL`,
    );
  }
}
