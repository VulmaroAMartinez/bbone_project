import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AreaType } from 'src/modules/catalogs/areas/presentation/types';
import { SubAreaType } from 'src/modules/catalogs/sub-areas/presentation/types';
import { SparePartType } from 'src/modules/catalogs/spare-parts/presentation/types';
import { WorkOrderType } from 'src/modules/work-orders/presentation/types';
import { MaterialRequestType } from 'src/modules/material-requests/presentation/types';

@ObjectType('Machine')
export class MachineType {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;

  // ── Relación directa con Área (nueva) ──
  @Field(() => ID, {
    nullable: true,
    description: 'ID del área directa (null si pertenece a sub-área)',
  })
  areaId?: string;

  @Field(() => AreaType, {
    nullable: true,
    description: 'Área directa (null si pertenece a sub-área)',
  })
  area?: AreaType;

  // ── Relación con Sub-área (ahora nullable) ──
  @Field(() => ID, {
    nullable: true,
    description: 'ID de la sub-área (null si pertenece directamente al área)',
  })
  subAreaId?: string;

  @Field(() => SubAreaType, {
    nullable: true,
    description: 'Sub-área (null si pertenece directamente al área)',
  })
  subArea?: SubAreaType;

  @Field({ nullable: true }) brand?: string;
  @Field({ nullable: true }) model?: string;
  @Field({ nullable: true }) manufacturer?: string;
  @Field({ nullable: true }) serialNumber?: string;
  @Field({ nullable: true }) installationDate?: Date;
  @Field({ nullable: true }) machinePhotoUrl?: string;
  @Field({ nullable: true }) operationalManualUrl?: string;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;

  @Field(() => [SparePartType], { nullable: true })
  spareParts?: SparePartType[];

  @Field(() => [WorkOrderType], { nullable: true })
  workOrders?: WorkOrderType[];

  @Field(() => [MaterialRequestType], { nullable: true })
  materialRequests?: MaterialRequestType[];
}
