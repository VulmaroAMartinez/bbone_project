import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuotationFieldsToMaterialRequestHistory20260515120000
  implements MigrationInterface
{
  name = 'AddQuotationFieldsToMaterialRequestHistory20260515120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material_request_history" ADD COLUMN IF NOT EXISTS "quotation_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_history" ADD COLUMN IF NOT EXISTS "quotation_cost" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material_request_history" DROP COLUMN IF EXISTS "quotation_cost"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_history" DROP COLUMN IF EXISTS "quotation_number"`,
    );
  }
}
