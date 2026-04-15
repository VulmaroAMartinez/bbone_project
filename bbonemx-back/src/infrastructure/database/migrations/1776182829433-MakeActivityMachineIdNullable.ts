import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeActivityMachineIdAndEndDateNullable1776182829433 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop NOT NULL constraint for machine_id
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "machine_id" DROP NOT NULL`,
    );
    // Drop NOT NULL constraint for end_date
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "machine_id" SET NOT NULL`,
    );
  }
}
