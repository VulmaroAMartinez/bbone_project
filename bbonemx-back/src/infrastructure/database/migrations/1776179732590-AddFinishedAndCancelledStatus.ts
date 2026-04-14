import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinishedAndCancelledStatus1776179732590 implements MigrationInterface {
  name = 'AddFinishedAndCancelledStatus1776179732590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."work_orders_status_enum" RENAME TO "work_orders_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_orders_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'COMPLETED', 'TEMPORARY_REPAIR', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" TYPE "public"."work_orders_status_enum" USING "status"::"text"::"public"."work_orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."work_orders_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_orders_status_enum_old" AS ENUM('PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'TEMPORARY_REPAIR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" TYPE "public"."work_orders_status_enum_old" USING "status"::"text"::"public"."work_orders_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."work_orders_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."work_orders_status_enum_old" RENAME TO "work_orders_status_enum"`,
    );
  }
}
