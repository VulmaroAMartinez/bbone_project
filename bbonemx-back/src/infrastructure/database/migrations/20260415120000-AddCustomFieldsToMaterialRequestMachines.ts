import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega columnas custom_machine_model y custom_machine_manufacturer
 * a material_request_machines, y hace machine_id nullable para soportar
 * la opción "Otro" (equipo no registrado en el catálogo).
 */
export class AddCustomFieldsToMaterialRequestMachines20260415120000 implements MigrationInterface {
  name = 'AddCustomFieldsToMaterialRequestMachines20260415120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        ADD COLUMN IF NOT EXISTS "custom_machine_name" character varying,
        ADD COLUMN IF NOT EXISTS "custom_machine_model" character varying,
        ADD COLUMN IF NOT EXISTS "custom_machine_manufacturer" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        ALTER COLUMN "machine_id" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert machine_id to NOT NULL (only safe if no NULL rows exist)
    await queryRunner.query(`
      DELETE FROM "material_request_machines" WHERE "machine_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        ALTER COLUMN "machine_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        DROP COLUMN IF EXISTS "custom_machine_name",
        DROP COLUMN IF EXISTS "custom_machine_model",
        DROP COLUMN IF EXISTS "custom_machine_manufacturer"
    `);
  }
}
