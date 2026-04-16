import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConformityFields20260416120000 implements MigrationInterface {
  name = 'AddConformityFields20260416120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- work_orders: nuevos campos de conformidad ---
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD COLUMN "pending_conformity" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD COLUMN "conformity_cycle_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD COLUMN "new_changes_description" text`,
    );

    // Índice parcial para consultas eficientes de OTs pendientes de conformidad
    await queryRunner.query(
      `CREATE INDEX "idx_wo_pending_conformity" ON "work_orders" ("requester_id") WHERE pending_conformity = true AND is_active = true`,
    );

    // --- Nueva tabla de registros de conformidad ---
    await queryRunner.query(`
      CREATE TABLE "work_order_conformity_records" (
        "id"                uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
        "deleted_at"        timestamp with time zone,
        "created_by"        uuid,
        "updated_by"        uuid,
        "deleted_by"        uuid,
        "is_active"         boolean      NOT NULL DEFAULT true,
        "work_order_id"     uuid         NOT NULL,
        "cycle_number"      integer      NOT NULL,
        "question1_answer"  varchar(20)  NOT NULL,
        "question2_answer"  boolean      NOT NULL,
        "question3_answer"  boolean      NOT NULL,
        "is_conforming"     boolean      NOT NULL,
        "reason"            text,
        "responded_by_id"   uuid         NOT NULL,
        "responded_at"      timestamp with time zone NOT NULL DEFAULT now(),
        "previous_status"   varchar(30)  NOT NULL,
        CONSTRAINT "PK_wo_conformity_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wo_conformity_records_work_order"
          FOREIGN KEY ("work_order_id")
          REFERENCES "work_orders"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_wo_conformity_records_responded_by"
          FOREIGN KEY ("responded_by_id")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_wo_conformity_records_wo_id" ON "work_order_conformity_records" ("work_order_id")`,
    );

    // --- users: area y sub-área opcionales ---
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "area_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "sub_area_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_sub_area" FOREIGN KEY ("sub_area_id") REFERENCES "sub_areas"("id")`,
    );

    // --- Actualizar enums de notificaciones con nuevo tipo ---
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER', 'WORK_ORDER_NON_CONFORMITY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);

    await queryRunner.query(
      `ALTER TYPE "public"."notification_preferences_notification_type_enum" RENAME TO "notification_preferences_notification_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_notification_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER', 'WORK_ORDER_NON_CONFORMITY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ALTER COLUMN "notification_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ALTER COLUMN "notification_type" TYPE "public"."notification_preferences_notification_type_enum" USING "notification_type"::"text"::"public"."notification_preferences_notification_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notification_preferences_notification_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir enums de notificaciones
    await queryRunner.query(
      `ALTER TYPE "public"."notification_preferences_notification_type_enum" RENAME TO "notification_preferences_notification_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_notification_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ALTER COLUMN "notification_type" TYPE "public"."notification_preferences_notification_type_enum" USING "notification_type"::"text"::"public"."notification_preferences_notification_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notification_preferences_notification_type_enum_old"`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);

    // Revertir users
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_sub_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_area"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sub_area_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "area_id"`);

    // Revertir tabla conformidad
    await queryRunner.query(`DROP TABLE "work_order_conformity_records"`);

    // Revertir work_orders
    await queryRunner.query(
      `DROP INDEX "idx_wo_pending_conformity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP COLUMN "new_changes_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP COLUMN "conformity_cycle_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP COLUMN "pending_conformity"`,
    );
  }
}
