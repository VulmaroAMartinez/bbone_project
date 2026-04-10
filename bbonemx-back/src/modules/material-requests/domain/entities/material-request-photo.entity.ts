import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { MaterialRequest } from './material-request.entity';
import { User } from 'src/modules/users/domain/entities';

@Entity({ name: 'material_request_photos' })
export class MaterialRequestPhoto extends BaseEntity {
  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(() => MaterialRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 50 })
  mimeType: string;

  @Column({
    name: 'uploaded_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadedAt: Date;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
