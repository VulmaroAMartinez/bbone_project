import { Module } from '@nestjs/common';
import { RolesModule } from './roles';
import { TechniciansModule } from './technicians';
import { PositionsModule } from './positions';
import { ShiftsModule } from './shifts';
import { AbsenceReasonsModule } from './absence-reasons';
import { AreasModule } from './areas';
import { MachinesModule } from './machines';
import { DepartmentsModule } from './departments';
import { SubAreasModule } from './sub-areas';
import { SparePartsModule } from './spare-parts';
import { MaterialsModule } from './materials';


@Module({
    imports: [RolesModule, TechniciansModule, PositionsModule, ShiftsModule, AbsenceReasonsModule, AreasModule, SubAreasModule, MachinesModule, DepartmentsModule, SparePartsModule, MaterialsModule],
    exports: [RolesModule, TechniciansModule, PositionsModule, ShiftsModule, AbsenceReasonsModule, AreasModule, SubAreasModule, MachinesModule, DepartmentsModule, SparePartsModule, MaterialsModule],
})
export class CatalogsModule {}
