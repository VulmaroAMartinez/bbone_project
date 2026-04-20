import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFindingPhotos20260420120000 implements MigrationInterface {
  name = 'AddFindingPhotos20260420120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "finding_photos" (
        "id"           uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
        "deleted_at"   timestamp with time zone,
        "created_by"   uuid,
        "updated_by"   uuid,
        "deleted_by"   uuid,
        "is_active"    boolean      NOT NULL DEFAULT true,
        "finding_id"   uuid         NOT NULL,
        "file_path"    varchar(500) NOT NULL,
        "file_name"    varchar(255) NOT NULL,
        "mime_type"    varchar(50)  NOT NULL,
        "uploaded_at"  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "uploaded_by"  uuid         NOT NULL,
        CONSTRAINT "PK_finding_photos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_finding_photos_finding"
          FOREIGN KEY ("finding_id")
          REFERENCES "findings"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_finding_photos_uploaded_by"
          FOREIGN KEY ("uploaded_by")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_finding_photos_finding_id" ON "finding_photos" ("finding_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_finding_photos_finding_id"`);
    await queryRunner.query(`DROP TABLE "finding_photos"`);
  }
}
