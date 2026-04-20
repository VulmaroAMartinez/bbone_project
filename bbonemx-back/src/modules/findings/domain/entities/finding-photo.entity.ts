import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { User } from 'src/modules/users/domain/entities';
import { Finding } from './finding.entity';

@Entity({ name: 'finding_photos' })
export class FindingPhoto extends BaseEntity {
  @Column({ name: 'finding_id', type: 'uuid' })
  findingId: string;

  @ManyToOne(() => Finding, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'finding_id' })
  finding: Finding;

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
