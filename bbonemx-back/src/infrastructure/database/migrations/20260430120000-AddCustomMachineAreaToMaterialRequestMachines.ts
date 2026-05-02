import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega la columna custom_machine_area a material_request_machines para
 * permitir registrar el área (string libre, sin FK al catálogo) cuando el
 * equipo seleccionado es "Otro" (no registrado en el catálogo).
 */
export class AddCustomMachineAreaToMaterialRequestMachines20260430120000 implements MigrationInterface {
  name = 'AddCustomMachineAreaToMaterialRequestMachines20260430120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        ADD COLUMN IF NOT EXISTS "custom_machine_area" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "material_request_machines"
        DROP COLUMN IF EXISTS "custom_machine_area"
    `);
  }
}
