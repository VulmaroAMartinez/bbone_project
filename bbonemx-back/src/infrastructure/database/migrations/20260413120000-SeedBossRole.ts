import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * El rol BOSS es necesario para marcar técnicos como jefes (user_roles).
 * Los seeds antiguos no lo creaban; se inserta de forma idempotente.
 */
export class SeedBossRole20260413120000 implements MigrationInterface {
  name = 'SeedBossRole20260413120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "is_active", "created_at", "updated_at")
      SELECT 'BOSS', true, now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'BOSS')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "roles" r
      WHERE r."name" = 'BOSS'
      AND NOT EXISTS (SELECT 1 FROM "user_roles" ur WHERE ur."role_id" = r."id")
    `);
  }
}
