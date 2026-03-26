import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema20260320213000 implements MigrationInterface {
  name = 'InitialSchema20260320213000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      `CREATE TYPE "areas_type_enum" AS ENUM('PRODUCTION', 'OPERATIONAL', 'SERVICE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "findings_status_enum" AS ENUM('OPEN', 'CONVERTED_TO_WO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "preventive_tasks_frequency_type_enum" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')`,
    );
    await queryRunner.query(
      `CREATE TYPE "preventive_tasks_frequency_unit_enum" AS ENUM('DAYS', 'HOURS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "preventive_tasks_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_orders_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'TEMPORARY_REPAIR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_orders_priority_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_orders_maintenance_type_enum" AS ENUM('PREVENTIVE', 'CORRECTIVE_EMERGENT', 'CORRECTIVE_SCHEDULED', 'FINDING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_orders_stop_type_enum" AS ENUM('BREAKDOWN', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_orders_work_type_enum" AS ENUM('PAINTING', 'PNEUMATIC', 'ELECTRONIC', 'ELECTRICAL', 'BUILDING', 'METROLOGY', 'AUTOMATION', 'MECHANICAL', 'HYDRAULIC', 'ELECTRICAL_CONTROL', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "work_order_photos_photo_type_enum" AS ENUM('BEFORE', 'AFTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "preventive_task_history_action_enum" AS ENUM('CREATED', 'UPDATED', 'DEACTIVATED', 'CLOSED', 'POLICY_CHANGE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_device_tokens_platform_enum" AS ENUM('WEB', 'ANDROID', 'IOS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "overtime_reason_for_payment_enum" AS ENUM('HOLIDAY', 'WORK_BREAK', 'OVERTIME')`,
    );
    await queryRunner.query(
      `CREATE TYPE "notifications_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "notification_preferences_notification_type_enum" AS ENUM('WORK_ORDER_ASSIGNED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_TEMPORARY_REPAIR', 'PREVENTIVE_TASK_WO_GENERATED', 'WORK_ORDER_CREATED_BY_REQUESTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "material_request_history_status_enum" AS ENUM('PENDING_PURCHASE_REQUEST', 'PENDING_QUOTATION', 'PENDING_APPROVAL_QUOTATION', 'PENDING_SUPPLIER_REGISTRATION', 'PENDING_PURCHASE_ORDER', 'PENDING_PAYMENT', 'PENDING_DELIVERY', 'DELIVERED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "material_requests_category_enum" AS ENUM('EQUIPMENT', 'PPE', 'TOOLS', 'MATERIAL_WITH_SKU', 'NON_INVENTORY_MATERIAL', 'REQUEST_SKU_MATERIAL', 'SPARE_PART_WITH_SKU', 'NON_INVENTORY_SPARE_PART', 'REQUEST_SKU_SPARE_PART', 'UPDATE_SKU', 'SERVICE', 'SERVICE_WITH_MATERIAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "material_requests_importance_enum" AS ENUM('VERY_IMPORTANT', 'IMPORTANT', 'UNIMPORTANT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "material_requests_priority_enum" AS ENUM('URGENT', 'SCHEDULED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "activities_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "audit_logs_action_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "employee_number" character varying NOT NULL, "password" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255), "phone" character varying(13), "department_id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, "description" text, "type" "areas_type_enum" NOT NULL DEFAULT 'OPERATIONAL', CONSTRAINT "PK_5110493f6342f34c978c084d0d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "area_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_acf3fea896b6df1bd20dd5ff732" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "machines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "code" character varying(50) NOT NULL, "name" character varying(200) NOT NULL, "description" text, "area_id" uuid, "sub_area_id" uuid, "brand" character varying(100), "model" character varying(100), "manufacturer" character varying(100), "serial_number" character varying(100), "installation_date" date, "machine_photo_url" character varying(500), "operational_manual_url" character varying(500), CONSTRAINT "PK_7b0817c674bb984650c5274e713" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, "start_time" time without time zone NOT NULL, "end_time" time without time zone NOT NULL, CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "findings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "sequence" integer NOT NULL, "folio" character varying(20) NOT NULL, "area_id" uuid NOT NULL, "machine_id" uuid, "shift_id" uuid NOT NULL, "description" text NOT NULL, "photo_path" character varying(500), "status" "findings_status_enum" NOT NULL DEFAULT 'OPEN', "converted_to_wo_id" uuid, "converted_at" timestamp without time zone, "converted_by" uuid, CONSTRAINT "PK_ae9807d6293c23c13ff8804d09c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "preventive_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "machine_id" uuid NOT NULL, "description" text NOT NULL, "frequency_type" "preventive_tasks_frequency_type_enum" NOT NULL, "frequency_unit" "preventive_tasks_frequency_unit_enum", "frequency_value" integer, "start_date" date NOT NULL, "next_execution_date" timestamp without time zone, "advance_hours" integer NOT NULL DEFAULT '24', "status" "preventive_tasks_status_enum" NOT NULL DEFAULT 'ACTIVE', "end_date" date, "policy_change_note" text, "parent_task_id" uuid, "last_wo_generated_at" timestamp without time zone, CONSTRAINT "PK_61af2005ebc825f4141ef7fedee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "sequence" integer NOT NULL, "folio" character varying(20) NOT NULL, "area_id" uuid NOT NULL, "sub_area_id" uuid, "description" text NOT NULL, "status" "work_orders_status_enum" NOT NULL DEFAULT 'PENDING', "priority" "work_orders_priority_enum", "maintenance_type" "work_orders_maintenance_type_enum", "stop_type" "work_orders_stop_type_enum", "assigned_shift_id" uuid, "requester_id" uuid NOT NULL, "machine_id" uuid, "scheduled_date" timestamp without time zone, "work_type" "work_orders_work_type_enum", "start_date" timestamp without time zone, "end_date" timestamp without time zone, "observations" text, "breakdown_description" text, "cause" text, "action_taken" text, "tools_used" text, "custom_spare_part" text, "custom_material" text, "downtime_minutes" integer, "pause_reason" text, "functional_time_minutes" integer NOT NULL DEFAULT '0', "last_resumed_at" timestamp without time zone, "finding_id" uuid, "preventive_task_id" uuid, CONSTRAINT "PK_29f6c1884082ee6f535aed93660" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_order_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_order_id" uuid NOT NULL, "photo_type" "work_order_photos_photo_type_enum" NOT NULL, "file_path" character varying(500) NOT NULL, "file_name" character varying(255) NOT NULL, "mime_type" character varying(50) NOT NULL, "uploaded_at" timestamp without time zone NOT NULL DEFAULT now(), "uploaded_by" uuid NOT NULL, CONSTRAINT "PK_ebd20ac413b724104207877fc9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_order_signatures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_order_id" uuid NOT NULL, "signer_id" uuid NOT NULL, "signature_image_path" character varying(500) NOT NULL, "signed_at" timestamp without time zone NOT NULL DEFAULT now(), "ip_address" character varying(45), CONSTRAINT "PK_a1fb7227138f75820ae9cf7efd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spare_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "machine_id" uuid NOT NULL, "part_number" character varying(100) NOT NULL, "brand" character varying(100), "model" character varying(100), "supplier" character varying(200), "unit_of_measure" character varying(50), CONSTRAINT "PK_6fe9b0bb96e021d248731580f1b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_order_spare_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_order_id" uuid NOT NULL, "spare_part_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "notes" text, CONSTRAINT "PK_60ae9f78c8a363c6bff97440fc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "description" text NOT NULL, "brand" character varying(100), "model" character varying(100), "part_number" character varying(100), "sku" character varying(100), "manufacturer" character varying(200), "unit_of_measure" character varying(50), CONSTRAINT "PK_2fd1a93ecb222a28bef28663fa0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_order_materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_order_id" uuid NOT NULL, "material_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "notes" text, CONSTRAINT "PK_ef5cf27418c13b17bdf514e58f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_order_technicians" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_order_id" uuid NOT NULL, "technician_id" uuid NOT NULL, "assigned_at" timestamp without time zone NOT NULL DEFAULT now(), "assigned_by" uuid NOT NULL, "is_lead" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_79d7bbe628b42635187aa368aa5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "preventive_task_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "preventive_task_id" uuid NOT NULL, "action" "preventive_task_history_action_enum" NOT NULL, "previous_values" jsonb, "new_values" jsonb, "change_reason" text, "changed_at" timestamp with time zone NOT NULL DEFAULT now(), "changed_by" uuid, CONSTRAINT "PK_71d7753a9f9ba72576bd8c28808" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "absence_reasons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, "max_per_week" integer DEFAULT '0', CONSTRAINT "PK_1fd91db59b1949393e72bef07ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "technician_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "technician_id" uuid NOT NULL, "schedule_date" date NOT NULL, "week_number" integer NOT NULL, "year" integer NOT NULL, "shift_id" uuid, "absence_reason_id" uuid, "notes" text, CONSTRAINT "PK_edc22a2c0147605affa00a6e376" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_device_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "fcm_token" text NOT NULL, "platform" "user_device_tokens_platform_enum" NOT NULL DEFAULT 'WEB', "device_name" character varying(255), "last_used_at" timestamp with time zone, "is_expired" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_089ca63b045947b89c77b06a79d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "name" character varying(100) NOT NULL, "description" character varying(255), CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "technicians" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "rfc" character varying(13), "nss" character varying(11), "blood_type" character varying(5) NOT NULL, "allergies" text NOT NULL, "emergency_contact_name" character varying(200) NOT NULL, "emergency_contact_phone" character varying(20) NOT NULL, "emergency_contact_relationship" character varying(50) NOT NULL, "birth_date" date NOT NULL, "address" text NOT NULL, "education" character varying(100) NOT NULL, "child_count" integer NOT NULL DEFAULT '0', "shirt_size" character varying(20) NOT NULL, "pants_size" character varying(20) NOT NULL, "shoe_size" character varying(20) NOT NULL, "transport_route" character varying(100) NOT NULL, "hire_date" date NOT NULL, "vacation_period" integer NOT NULL DEFAULT '0', "position_id" uuid NOT NULL, CONSTRAINT "PK_b14514b23605f79475be53065b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "overtime" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "work_date" date NOT NULL, "start_time" time without time zone NOT NULL, "end_time" time without time zone NOT NULL, "activity" text NOT NULL, "reason_for_payment" "overtime_reason_for_payment_enum", "technician_id" uuid NOT NULL, CONSTRAINT "PK_9c8b3927dee0be83907202c2389" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "recipient_id" uuid NOT NULL, "type" "notifications_type_enum" NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "data" jsonb, "read_at" timestamp with time zone, "push_sent" boolean NOT NULL DEFAULT false, "email_sent" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "notification_type" "notification_preferences_notification_type_enum" NOT NULL, "push_enabled" boolean NOT NULL DEFAULT true, "email_enabled" boolean NOT NULL DEFAULT true, "in_app_enabled" boolean NOT NULL DEFAULT true, "quiet_hours_start" time without time zone, "quiet_hours_end" time without time zone, CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "material_request_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "material_request_id" uuid NOT NULL, "material_id" uuid, "spare_part_id" uuid, "description" character varying, "custom_name" character varying, "sku" character varying, "partNumber" character varying, "brand" character varying, "model" character varying, "unitOfMeasure" character varying(20), "requestedQuantity" integer, "proposed_max_stock" integer, "proposed_min_stock" integer, "is_generic_allowed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d978a89b84dad12899d6a080a56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "material_request_machines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "material_request_id" uuid NOT NULL, "machine_id" uuid NOT NULL, CONSTRAINT "PK_93b6bdb88e3929e73fc21775596" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "material_request_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "material_request_id" uuid NOT NULL, "status" "material_request_history_status_enum" NOT NULL DEFAULT 'PENDING_PURCHASE_REQUEST', "purchase_request" character varying, "purchase_order" character varying, "delivery_merchandise" character varying, "delivery_date" timestamp with time zone, "progress_percentage" integer, "supplier" character varying, CONSTRAINT "PK_3e7dbbe58a9a36771772b78c5b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "material_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "sequence" integer NOT NULL, "folio" character varying NOT NULL, "boss" text NOT NULL, "category" "material_requests_category_enum" NOT NULL, "importance" "material_requests_importance_enum" NOT NULL, "priority" "material_requests_priority_enum" NOT NULL, "custom_machine_name" character varying, "custom_machine_brand" character varying, "custom_machine_model" character varying, "custom_machine_manufacturer" character varying, "description" text, "justification" text, "suggested_supplier" character varying, "comments" text, "email_sent_at" timestamp with time zone, "requester_id" uuid NOT NULL, CONSTRAINT "PK_02316f941b471665a48e9659454" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "token_hash" character varying(128) NOT NULL, "expires_at" timestamp with time zone NOT NULL, "revoked_at" timestamp with time zone, "rotated_from_token_id" uuid, "ip_address" character varying(64), "user_agent" character varying(512), CONSTRAINT "PK_df6893d2063a4ea7bbf1eda31e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_technicians" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "activity_id" uuid NOT NULL, "technician_id" uuid NOT NULL, "assigned_at" timestamp without time zone NOT NULL DEFAULT now(), "assigned_by" uuid NOT NULL, CONSTRAINT "PK_fa3b14a6871cc01a17f30c74f0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_work_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "activity_id" uuid NOT NULL, "work_order_id" uuid NOT NULL, CONSTRAINT "PK_aa244b8fc298ea6e972c211c217" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_material_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "activity_id" uuid NOT NULL, "material_request_id" uuid NOT NULL, CONSTRAINT "PK_77bc815020b7ab0a3f810db0ded" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "is_active" boolean NOT NULL DEFAULT true, "area_id" uuid NOT NULL, "machine_id" uuid NOT NULL, "activity" character varying(500) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "progress" integer NOT NULL DEFAULT '0', "status" "activities_status_enum" NOT NULL DEFAULT 'PENDING', "comments" text, "priority" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "table_name" character varying(100) NOT NULL, "record_id" uuid NOT NULL, "action" "audit_logs_action_enum" NOT NULL, "old_values" jsonb, "new_values" jsonb, "changed_fields" jsonb, "user_id" uuid, "ip_address" character varying(45), "user_agent" text, "session_id" character varying(255), "created_at" timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_23ed6f04fe43066df08379fd03" ON "user_roles" ("user_id", "role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_4541de56cf6586feb53ff762ea2" UNIQUE ("employee_number")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4541de56cf6586feb53ff762ea" ON "users" ("employee_number")`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "UQ_dafffa18dcdfbab2fb17ea2bd86" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "CHK_machine_area_xor_subarea" CHECK ((area_id IS NOT NULL AND sub_area_id IS NULL) OR (area_id IS NULL AND sub_area_id IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "UQ_d6ee2878f79abecb1c14a238ae0" UNIQUE ("folio")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d6ee2878f79abecb1c14a238ae" ON "findings" ("folio")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "UQ_19efb316071f7f74edd518704f2" UNIQUE ("folio")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_19efb316071f7f74edd518704f" ON "work_orders" ("folio")`,
    );
    await queryRunner.query(
      `ALTER TABLE "materials" ADD CONSTRAINT "UQ_2c638e9b0ddf9b957accdaa911a" UNIQUE ("sku")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" ADD CONSTRAINT "UQ_4e48f78c3d3f5da0548d8678653" UNIQUE ("work_order_id", "technician_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" ADD CONSTRAINT "UQ_technician_schedule_date" UNIQUE ("technician_id", "schedule_date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_device_tokens" ADD CONSTRAINT "UQ_user_device_token" UNIQUE ("user_id", "fcm_token")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_device_token_user" ON "user_device_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" ADD CONSTRAINT "UQ_d86d7aa49aa7823f841ac49b0ba" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" ADD CONSTRAINT "REL_d86d7aa49aa7823f841ac49b0b" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_type" ON "notifications" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_recipient_read" ON "notifications" ("recipient_id", "read_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ADD CONSTRAINT "UQ_user_notification_type" UNIQUE ("user_id", "notification_type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" ADD CONSTRAINT "UQ_d0db956060ab1e9d192c3a0e79d" UNIQUE ("material_request_id", "material_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" ADD CONSTRAINT "UQ_bfecab1af7e33d95f1c54230a25" UNIQUE ("material_request_id", "machine_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests" ADD CONSTRAINT "UQ_8b777daf34bf204ba31b33ebb00" UNIQUE ("folio")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8b777daf34bf204ba31b33ebb0" ON "material_requests" ("folio")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f795ad14f31838e3ddc663ee15" ON "auth_refresh_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_95e0bce05491b0dee2f28ffd11" ON "auth_refresh_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" ADD CONSTRAINT "UQ_2802350972f6c8688b7b2441b02" UNIQUE ("activity_id", "technician_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" ADD CONSTRAINT "UQ_dec6b3351a085fd8a0fe630de86" UNIQUE ("activity_id", "work_order_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" ADD CONSTRAINT "UQ_4b852a3463d2682784e95d02ed5" UNIQUE ("activity_id", "material_request_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45575c290a2b47aa366e853d07" ON "audit_logs" ("table_name", "record_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_areas" ADD CONSTRAINT "FK_1f492fee4187f745f580323c62a" FOREIGN KEY ("area_id") REFERENCES "areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "FK_ae194843d83f7a0336c49220182" FOREIGN KEY ("area_id") REFERENCES "areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "FK_a3ca445a740de04d1c456248c80" FOREIGN KEY ("sub_area_id") REFERENCES "sub_areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "FK_e950e336585e8c6666f42497a6c" FOREIGN KEY ("area_id") REFERENCES "areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "FK_3a6e8fa3df322d66902560527a3" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "FK_7c4a70c2d6012f1d373b3155aa0" FOREIGN KEY ("shift_id") REFERENCES "shifts" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "FK_692672ec0f541975cf47b0345ba" FOREIGN KEY ("converted_to_wo_id") REFERENCES "work_orders" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" ADD CONSTRAINT "FK_65fdabacdab36a279742e00ca43" FOREIGN KEY ("converted_by") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_tasks" ADD CONSTRAINT "FK_69d72da07d692d0481720ff5dc2" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_tasks" ADD CONSTRAINT "FK_d49c60361132f45b8880b27dfcf" FOREIGN KEY ("parent_task_id") REFERENCES "preventive_tasks" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_67ace78bf1b50a12b066a71f50b" FOREIGN KEY ("area_id") REFERENCES "areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_078161fec46000177dbc7f129f2" FOREIGN KEY ("sub_area_id") REFERENCES "sub_areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_552f0500eb67d821bcde585abbf" FOREIGN KEY ("assigned_shift_id") REFERENCES "shifts" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_e09b5ab338a76297c069e22f5b0" FOREIGN KEY ("requester_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_cb53584b8b20af62e8a78ce8a6f" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_60821d5d85958c0796d5845b2a6" FOREIGN KEY ("finding_id") REFERENCES "findings" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_e99846bb200e3b3acad7ed89a89" FOREIGN KEY ("preventive_task_id") REFERENCES "preventive_tasks" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_photos" ADD CONSTRAINT "FK_3b232957a1b6082775dbdd30f44" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_photos" ADD CONSTRAINT "FK_6f3685c3fd8943c282707754ec8" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_signatures" ADD CONSTRAINT "FK_2ab76d4b813be2c0b45a61383f1" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_signatures" ADD CONSTRAINT "FK_88bc07c4c1ca3af9c42243df537" FOREIGN KEY ("signer_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "spare_parts" ADD CONSTRAINT "FK_493b8466d60c9dac06d0fd012e9" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_spare_parts" ADD CONSTRAINT "FK_b66f76813e9db9e2f264729147c" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_spare_parts" ADD CONSTRAINT "FK_771683d38d06216be41ba53158e" FOREIGN KEY ("spare_part_id") REFERENCES "spare_parts" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_materials" ADD CONSTRAINT "FK_259c6f46d9485959a5912a4b678" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_materials" ADD CONSTRAINT "FK_062155b1581f3519437d4dc2eb2" FOREIGN KEY ("material_id") REFERENCES "materials" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" ADD CONSTRAINT "FK_aabceb2324c13810a00205063c4" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" ADD CONSTRAINT "FK_130b2108ce80baea1ccd4d5dc17" FOREIGN KEY ("technician_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" ADD CONSTRAINT "FK_924a731cdb8eedde9cf5e004e56" FOREIGN KEY ("assigned_by") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_task_history" ADD CONSTRAINT "FK_f210fd5edc27ba4dc5d98f1aeb3" FOREIGN KEY ("preventive_task_id") REFERENCES "preventive_tasks" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_task_history" ADD CONSTRAINT "FK_daa250fb8a3fa9605dc2afdc315" FOREIGN KEY ("changed_by") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" ADD CONSTRAINT "FK_755e058a3ce690fe565844f7f94" FOREIGN KEY ("technician_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" ADD CONSTRAINT "FK_319bcb6c54dbc7caf5fc0b98e3a" FOREIGN KEY ("shift_id") REFERENCES "shifts" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" ADD CONSTRAINT "FK_420ad9b49d7d1eac4af3ca3883b" FOREIGN KEY ("absence_reason_id") REFERENCES "absence_reasons" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_device_tokens" ADD CONSTRAINT "FK_0fdbbe2123d6d62dfa270ea8947" FOREIGN KEY ("user_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" ADD CONSTRAINT "FK_d86d7aa49aa7823f841ac49b0ba" FOREIGN KEY ("user_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" ADD CONSTRAINT "FK_a0806467468bfd5c523c18554be" FOREIGN KEY ("position_id") REFERENCES "positions" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "overtime" ADD CONSTRAINT "FK_952f328effe7719245c051159cb" FOREIGN KEY ("technician_id") REFERENCES "technicians" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d" FOREIGN KEY ("recipient_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" ADD CONSTRAINT "FK_0b3ae89fff883de12a76cae4db5" FOREIGN KEY ("material_request_id") REFERENCES "material_requests" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" ADD CONSTRAINT "FK_a2d32987af87e41affc9c64346c" FOREIGN KEY ("material_id") REFERENCES "materials" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" ADD CONSTRAINT "FK_a7542836b9fc03066320db607c2" FOREIGN KEY ("spare_part_id") REFERENCES "spare_parts" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" ADD CONSTRAINT "FK_dd8cc330e75057ece553ea89ffa" FOREIGN KEY ("material_request_id") REFERENCES "material_requests" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" ADD CONSTRAINT "FK_cc0b32b091f31b0d8d8fb809ccf" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_history" ADD CONSTRAINT "FK_e18d7433ded9fe03a3f54af488b" FOREIGN KEY ("material_request_id") REFERENCES "material_requests" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests" ADD CONSTRAINT "FK_a2f8274c1ed9195dff87f6a0562" FOREIGN KEY ("requester_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "FK_f795ad14f31838e3ddc663ee150" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" ADD CONSTRAINT "FK_c913ae78bb5f30db84f9319a231" FOREIGN KEY ("activity_id") REFERENCES "activities" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" ADD CONSTRAINT "FK_cf5d2e6ba3fe964451f99c05c4f" FOREIGN KEY ("technician_id") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" ADD CONSTRAINT "FK_b9624b9986c38134036d4b4f1cf" FOREIGN KEY ("assigned_by") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" ADD CONSTRAINT "FK_4c03460e63f3410b708a1e19fbb" FOREIGN KEY ("activity_id") REFERENCES "activities" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" ADD CONSTRAINT "FK_95f50c4cf1c2ea2df01982c8fe4" FOREIGN KEY ("work_order_id") REFERENCES "work_orders" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" ADD CONSTRAINT "FK_f691dfff17796f6255271952058" FOREIGN KEY ("activity_id") REFERENCES "activities" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" ADD CONSTRAINT "FK_229b5f7587c723a63c008908321" FOREIGN KEY ("material_request_id") REFERENCES "material_requests" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_c235cdc44842f2ebc02e7137cfd" FOREIGN KEY ("area_id") REFERENCES "areas" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_376d17b2c3f8505d4dbb2cf7096" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_376d17b2c3f8505d4dbb2cf7096"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_c235cdc44842f2ebc02e7137cfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" DROP CONSTRAINT IF EXISTS "FK_229b5f7587c723a63c008908321"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" DROP CONSTRAINT IF EXISTS "FK_f691dfff17796f6255271952058"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" DROP CONSTRAINT IF EXISTS "FK_95f50c4cf1c2ea2df01982c8fe4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" DROP CONSTRAINT IF EXISTS "FK_4c03460e63f3410b708a1e19fbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" DROP CONSTRAINT IF EXISTS "FK_b9624b9986c38134036d4b4f1cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" DROP CONSTRAINT IF EXISTS "FK_cf5d2e6ba3fe964451f99c05c4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" DROP CONSTRAINT IF EXISTS "FK_c913ae78bb5f30db84f9319a231"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_f795ad14f31838e3ddc663ee150"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests" DROP CONSTRAINT IF EXISTS "FK_a2f8274c1ed9195dff87f6a0562"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_history" DROP CONSTRAINT IF EXISTS "FK_e18d7433ded9fe03a3f54af488b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" DROP CONSTRAINT IF EXISTS "FK_cc0b32b091f31b0d8d8fb809ccf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" DROP CONSTRAINT IF EXISTS "FK_dd8cc330e75057ece553ea89ffa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" DROP CONSTRAINT IF EXISTS "FK_a7542836b9fc03066320db607c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" DROP CONSTRAINT IF EXISTS "FK_a2d32987af87e41affc9c64346c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" DROP CONSTRAINT IF EXISTS "FK_0b3ae89fff883de12a76cae4db5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" DROP CONSTRAINT IF EXISTS "FK_64c90edc7310c6be7c10c96f675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_5332a4daa46fd3f4e6625dd275d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "overtime" DROP CONSTRAINT IF EXISTS "FK_952f328effe7719245c051159cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" DROP CONSTRAINT IF EXISTS "FK_a0806467468bfd5c523c18554be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" DROP CONSTRAINT IF EXISTS "FK_d86d7aa49aa7823f841ac49b0ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_device_tokens" DROP CONSTRAINT IF EXISTS "FK_0fdbbe2123d6d62dfa270ea8947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" DROP CONSTRAINT IF EXISTS "FK_420ad9b49d7d1eac4af3ca3883b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" DROP CONSTRAINT IF EXISTS "FK_319bcb6c54dbc7caf5fc0b98e3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" DROP CONSTRAINT IF EXISTS "FK_755e058a3ce690fe565844f7f94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_task_history" DROP CONSTRAINT IF EXISTS "FK_daa250fb8a3fa9605dc2afdc315"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_task_history" DROP CONSTRAINT IF EXISTS "FK_f210fd5edc27ba4dc5d98f1aeb3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" DROP CONSTRAINT IF EXISTS "FK_924a731cdb8eedde9cf5e004e56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" DROP CONSTRAINT IF EXISTS "FK_130b2108ce80baea1ccd4d5dc17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" DROP CONSTRAINT IF EXISTS "FK_aabceb2324c13810a00205063c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_materials" DROP CONSTRAINT IF EXISTS "FK_062155b1581f3519437d4dc2eb2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_materials" DROP CONSTRAINT IF EXISTS "FK_259c6f46d9485959a5912a4b678"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_spare_parts" DROP CONSTRAINT IF EXISTS "FK_771683d38d06216be41ba53158e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_spare_parts" DROP CONSTRAINT IF EXISTS "FK_b66f76813e9db9e2f264729147c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "spare_parts" DROP CONSTRAINT IF EXISTS "FK_493b8466d60c9dac06d0fd012e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_signatures" DROP CONSTRAINT IF EXISTS "FK_88bc07c4c1ca3af9c42243df537"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_signatures" DROP CONSTRAINT IF EXISTS "FK_2ab76d4b813be2c0b45a61383f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_photos" DROP CONSTRAINT IF EXISTS "FK_6f3685c3fd8943c282707754ec8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_photos" DROP CONSTRAINT IF EXISTS "FK_3b232957a1b6082775dbdd30f44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_e99846bb200e3b3acad7ed89a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_60821d5d85958c0796d5845b2a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_cb53584b8b20af62e8a78ce8a6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_e09b5ab338a76297c069e22f5b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_552f0500eb67d821bcde585abbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_078161fec46000177dbc7f129f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "FK_67ace78bf1b50a12b066a71f50b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_tasks" DROP CONSTRAINT IF EXISTS "FK_d49c60361132f45b8880b27dfcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preventive_tasks" DROP CONSTRAINT IF EXISTS "FK_69d72da07d692d0481720ff5dc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "FK_65fdabacdab36a279742e00ca43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "FK_692672ec0f541975cf47b0345ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "FK_7c4a70c2d6012f1d373b3155aa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "FK_3a6e8fa3df322d66902560527a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "FK_e950e336585e8c6666f42497a6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" DROP CONSTRAINT IF EXISTS "FK_a3ca445a740de04d1c456248c80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" DROP CONSTRAINT IF EXISTS "FK_ae194843d83f7a0336c49220182"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_areas" DROP CONSTRAINT IF EXISTS "FK_1f492fee4187f745f580323c62a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_0921d1972cf861d568f5271cd85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_45575c290a2b47aa366e853d07"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_bd2726fd31b35443f2245b93ba"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_2cd10fda8276bb995288acfbfb"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cee5459245f652b75eb2759b4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_material_requests" DROP CONSTRAINT IF EXISTS "UQ_4b852a3463d2682784e95d02ed5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_work_orders" DROP CONSTRAINT IF EXISTS "UQ_dec6b3351a085fd8a0fe630de86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_technicians" DROP CONSTRAINT IF EXISTS "UQ_2802350972f6c8688b7b2441b02"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_95e0bce05491b0dee2f28ffd11"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_f795ad14f31838e3ddc663ee15"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_8b777daf34bf204ba31b33ebb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_requests" DROP CONSTRAINT IF EXISTS "UQ_8b777daf34bf204ba31b33ebb00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_machines" DROP CONSTRAINT IF EXISTS "UQ_bfecab1af7e33d95f1c54230a25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "material_request_items" DROP CONSTRAINT IF EXISTS "UQ_d0db956060ab1e9d192c3a0e79d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" DROP CONSTRAINT IF EXISTS "UQ_user_notification_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_notification_recipient_read"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_type"`);
    await queryRunner.query(
      `ALTER TABLE "technicians" DROP CONSTRAINT IF EXISTS "REL_d86d7aa49aa7823f841ac49b0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technicians" DROP CONSTRAINT IF EXISTS "UQ_d86d7aa49aa7823f841ac49b0ba"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_device_token_user"`);
    await queryRunner.query(
      `ALTER TABLE "user_device_tokens" DROP CONSTRAINT IF EXISTS "UQ_user_device_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "technician_schedules" DROP CONSTRAINT IF EXISTS "UQ_technician_schedule_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_technicians" DROP CONSTRAINT IF EXISTS "UQ_4e48f78c3d3f5da0548d8678653"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materials" DROP CONSTRAINT IF EXISTS "UQ_2c638e9b0ddf9b957accdaa911a"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_19efb316071f7f74edd518704f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "UQ_19efb316071f7f74edd518704f2"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_d6ee2878f79abecb1c14a238ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT IF EXISTS "UQ_d6ee2878f79abecb1c14a238ae0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" DROP CONSTRAINT IF EXISTS "CHK_machine_area_xor_subarea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" DROP CONSTRAINT IF EXISTS "UQ_dafffa18dcdfbab2fb17ea2bd86"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_4541de56cf6586feb53ff762ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_4541de56cf6586feb53ff762ea2"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_23ed6f04fe43066df08379fd03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "UQ_648e3f5447f725579d7d4ffdfb7"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "activity_material_requests"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_work_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_technicians"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material_request_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material_request_machines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material_request_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "overtime"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technicians"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "positions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_device_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_schedules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "absence_reasons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "preventive_task_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_technicians"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_materials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "materials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_spare_parts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "spare_parts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_signatures"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_photos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "preventive_tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "findings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shifts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "machines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sub_areas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "areas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_logs_action_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "activities_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "material_requests_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "material_requests_importance_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "material_requests_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "material_request_history_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "notification_preferences_notification_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "overtime_reason_for_payment_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "user_device_tokens_platform_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "preventive_task_history_action_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "work_order_photos_photo_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "work_orders_work_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "work_orders_stop_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "work_orders_maintenance_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "work_orders_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "work_orders_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "preventive_tasks_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "preventive_tasks_frequency_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "preventive_tasks_frequency_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "findings_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "areas_type_enum"`);
  }
}
