import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionToFindings20260420200000 implements MigrationInterface {
  name = 'AddCollectionToFindings20260420200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "findings" ADD COLUMN "collection" varchar(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "findings" DROP COLUMN "collection"`);
  }
}
