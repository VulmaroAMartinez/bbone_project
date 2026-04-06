import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkuToSpareParts20260406120000 implements MigrationInterface {
  name = 'AddSkuToSpareParts20260406120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ADD COLUMN IF NOT EXISTS "sku" character varying(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spare_parts" DROP COLUMN IF EXISTS "sku"`,
    );
  }
}
