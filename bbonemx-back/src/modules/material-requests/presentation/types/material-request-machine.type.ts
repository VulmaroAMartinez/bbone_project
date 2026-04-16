import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MachineType } from 'src/modules/catalogs/machines/presentation/types';

@ObjectType('MaterialRequestMachine')
export class MaterialRequestMachineType {
  @Field(() => ID) id: string;
  @Field(() => ID, { nullable: true }) machineId?: string;
  @Field(() => MachineType, { nullable: true }) machine?: MachineType;
  @Field({ nullable: true }) customMachineName?: string;
  @Field({ nullable: true }) customMachineModel?: string;
  @Field({ nullable: true }) customMachineManufacturer?: string;
}
