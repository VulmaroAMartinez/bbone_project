import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEstimatedDeliveryDateToHistory20260409120000 implements MigrationInterface {
  name = 'AddEstimatedDeliveryDateToHistory20260409120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material_request_history" ADD COLUMN IF NOT EXISTS "estimated_delivery_date" date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "material_request_history" DROP COLUMN IF EXISTS "estimated_delivery_date"`,
    );
  }
}
