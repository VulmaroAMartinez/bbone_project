import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MaterialRequestMaterial } from "../../domain/entities";

@Injectable()
export class MaterialRequestMaterialsRepository {
    constructor(@InjectRepository(MaterialRequestMaterial) private readonly repository: Repository<MaterialRequestMaterial>) {}

    async findByRequestId(materialRequestId: string): Promise<MaterialRequestMaterial[]> {
        return this.repository.find({ where: { materialRequestId }, relations: ['material'] });
    }

    async create(data: Partial<MaterialRequestMaterial>): Promise<MaterialRequestMaterial> {
        const saved = await this.repository.save(this.repository.create(data));
        return this.repository.findOne({ where: { id: saved.id }, relations: ['material'] }) as Promise<MaterialRequestMaterial>;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
