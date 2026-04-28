import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMaterialRequestItemMaterialUnique20260428123000 implements MigrationInterface {
  name = 'DropMaterialRequestItemMaterialUnique20260428123000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT c.conname
        INTO constraint_name
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE c.contype = 'u'
          AND t.relname = 'material_request_items'
          AND n.nspname = 'public'
          AND pg_get_constraintdef(c.oid) ILIKE '%UNIQUE (material_request_id, material_id)%'
        LIMIT 1;

        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE "material_request_items" DROP CONSTRAINT %I', constraint_name);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT material_request_id, material_id
        FROM material_request_items
        WHERE material_id IS NOT NULL
        GROUP BY material_request_id, material_id
        HAVING COUNT(*) > 1
      ) duplicated_pairs
    `)) as Array<{ count: number }>;
    const duplicatedPairs = Number(rows[0]?.count ?? 0);

    if (duplicatedPairs > 0) {
      throw new Error(
        `Rollback abortado: existen ${duplicatedPairs} pares duplicados de (material_request_id, material_id).`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "material_request_items"
      ADD CONSTRAINT "UQ_material_request_items_request_material"
      UNIQUE ("material_request_id", "material_id")
    `);
  }
}
