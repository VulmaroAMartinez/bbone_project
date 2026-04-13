import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsToSpareParts1776040262715 implements MigrationInterface {
  name = 'AddFieldsToSpareParts1776040262715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "spare_parts" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ADD "cantidad" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ADD "costo" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "spare_parts" DROP COLUMN "costo"`);
    await queryRunner.query(`ALTER TABLE "spare_parts" DROP COLUMN "cantidad"`);
    await queryRunner.query(
      `ALTER TABLE "spare_parts" DROP COLUMN "description"`,
    );
  }
}
