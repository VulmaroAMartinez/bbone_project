import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddMaterialRequestPhotos20260409140000 implements MigrationInterface {
  name = 'AddMaterialRequestPhotos20260409140000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'material_request_photos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'material_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'uploaded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'uploaded_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'material_request_photos',
      new TableIndex({
        name: 'IDX_MR_PHOTOS_MATERIAL_REQUEST_ID',
        columnNames: ['material_request_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'material_request_photos',
      new TableForeignKey({
        name: 'FK_MR_PHOTOS_MATERIAL_REQUEST',
        columnNames: ['material_request_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'material_requests',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'material_request_photos',
      new TableForeignKey({
        name: 'FK_MR_PHOTOS_UPLOADED_BY',
        columnNames: ['uploaded_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('material_request_photos');
    if (table) {
      const fkMR = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('material_request_id'),
      );
      const fkUser = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('uploaded_by'),
      );
      if (fkMR)
        await queryRunner.dropForeignKey('material_request_photos', fkMR);
      if (fkUser)
        await queryRunner.dropForeignKey('material_request_photos', fkUser);
    }
    await queryRunner.dropTable('material_request_photos', true);
  }
}
