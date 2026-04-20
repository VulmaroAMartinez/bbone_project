import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindingPhoto } from '../../domain/entities';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
];

@Injectable()
export class FindingPhotosService {
  constructor(
    @InjectRepository(FindingPhoto)
    private readonly repository: Repository<FindingPhoto>,
  ) {}

  findByFindingId(findingId: string): Promise<FindingPhoto[]> {
    return this.repository.find({
      where: { findingId, isActive: true },
      order: { uploadedAt: 'ASC' },
    });
  }

  async findByIdOrFail(id: string): Promise<FindingPhoto> {
    const photo = await this.repository.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Foto de hallazgo no encontrada');
    return photo;
  }

  async create(
    input: {
      findingId: string;
      filePath: string;
      fileName: string;
      mimeType: string;
    },
    userId: string,
  ): Promise<FindingPhoto> {
    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
    const photo = this.repository.create({
      ...input,
      uploadedBy: userId,
      uploadedAt: new Date(),
    });
    return this.repository.save(photo);
  }

  async delete(id: string, userId: string): Promise<void> {
    const photo = await this.findByIdOrFail(id);
    photo.isActive = false;
    photo.deletedAt = new Date();
    photo.deletedBy = userId;
    await this.repository.save(photo);
  }
}
