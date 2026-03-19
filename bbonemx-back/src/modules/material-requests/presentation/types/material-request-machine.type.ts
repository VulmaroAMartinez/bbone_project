import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MachineType } from 'src/modules/catalogs/machines/presentation/types';

@ObjectType('MaterialRequestMachine')
export class MaterialRequestMachineType {
  @Field(() => ID) id: string;
  @Field(() => ID) machineId: string;
  @Field(() => MachineType) machine: MachineType;
}
