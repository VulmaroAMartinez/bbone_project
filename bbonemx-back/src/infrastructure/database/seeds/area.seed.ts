import { DataSource } from "typeorm";
import { Area } from "src/modules/catalogs/areas/domain/entities/area.entity";
import { AreaType } from "src/common";
import { SubArea } from "src/modules/catalogs/sub-areas/domain/entities/sub-area.entity";

const INITIAL_AREAS = [
    { name: 'TI', description: 'Tecnologías de la Información', type: AreaType.SERVICE},
    { name: 'Comedores', description: 'Comedores', type: AreaType.SERVICE},
    { name: 'Cocedores', description: 'Cocedores', type: AreaType.OPERATIONAL},
    { name: 'Enlatado', description: 'Enlatado', type: AreaType.OPERATIONAL}
];

const INITIAL_SUB_AREAS = [
    { name: 'Línea 1', description: 'Línea 1'},
    { name: 'Línea 2', description: 'Línea 2'},
]

export async function seedAreas(dataSource: DataSource): Promise<void> {
    const areaRepository = dataSource.getRepository(Area);

    for (const areaData of INITIAL_AREAS) {
        const existingArea = await areaRepository.findOne({
            where: { name: areaData.name },
        });

        if (existingArea) {
            continue;
        }

        const area = areaRepository.create({
            name: areaData.name,
            description: areaData.description,
            type: areaData.type,
            isActive: true,
        });

        await areaRepository.save(area);
    }
}

export async function getAreaByName(dataSource: DataSource, areaName: string): Promise<Area | null> {
    const areaRepository = dataSource.getRepository(Area);
    return areaRepository.findOne({ where: { name: areaName } });
}

export async function seedSubAreas(dataSource: DataSource): Promise<void> {
    const subAreaRepository = dataSource.getRepository(SubArea);

    for (const subAreaData of INITIAL_SUB_AREAS) {
        const area = await getAreaByName(dataSource, 'Enlatado');

        if (!area) throw new Error('El área Enlatado no existe');

        const existingSubArea = await subAreaRepository.findOne({
            where: { name: subAreaData.name, areaId: area.id },
        });

        if (existingSubArea) continue;

        const subArea = subAreaRepository.create({
            name: subAreaData.name,
            description: subAreaData.description,
            areaId: area.id,
            isActive: true,
        });

        await subAreaRepository.save(subArea);
    }
}

