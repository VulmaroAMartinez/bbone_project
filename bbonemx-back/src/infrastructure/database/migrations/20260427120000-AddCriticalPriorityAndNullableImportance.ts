import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCriticalPriorityAndNullableImportance20260427120000 implements MigrationInterface {
  name = 'AddCriticalPriorityAndNullableImportance20260427120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar valor CRITICAL al enum de prioridad.
    //    ALTER TYPE ... ADD VALUE no puede ejecutarse dentro de una transacción
    //    activa. Hacemos commit explícito antes y reabrimos la transacción al final.
    await queryRunner.commitTransaction();

    await queryRunner.query(
      `ALTER TYPE "material_requests_priority_enum" ADD VALUE IF NOT EXISTS 'CRITICAL'`,
    );

    await queryRunner.startTransaction();

    // 2. Hacer la columna importance nullable
    await queryRunner.query(
      `ALTER TABLE "material_requests" ALTER COLUMN "importance" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 2. Revertir importance a NOT NULL.
    //    Primero asignamos un valor por defecto a las filas NULL para evitar
    //    que el ALTER falle en producción si ya hay registros sin importancia.
    await queryRunner.query(
      `UPDATE "material_requests" SET "importance" = 'IMPORTANT' WHERE "importance" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests" ALTER COLUMN "importance" SET NOT NULL`,
    );

    // 1. Eliminar el valor CRITICAL del enum de prioridad.
    //    Postgres no permite DROP VALUE directamente; hay que recrear el tipo.
    //    ADVERTENCIA: si existen filas con priority = 'CRITICAL', el CAST fallará.
    //    Hay que migrar esos datos antes de correr el down.
    await queryRunner.query(
      `ALTER TYPE "material_requests_priority_enum" RENAME TO "material_requests_priority_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "material_requests_priority_enum" AS ENUM('URGENT', 'SCHEDULED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests"
        ALTER COLUMN "priority" DROP DEFAULT,
        ALTER COLUMN "priority" TYPE "material_requests_priority_enum"
          USING "priority"::text::"material_requests_priority_enum"`,
    );
    await queryRunner.query(`DROP TYPE "material_requests_priority_enum_old"`);
  }
}
