import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeActivityMachineIdNullable1776182829433 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // We use raw SQL to avoid loading entities that might fail due to path aliases
        await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "machine_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "machine_id" SET NOT NULL`);
    }
}
