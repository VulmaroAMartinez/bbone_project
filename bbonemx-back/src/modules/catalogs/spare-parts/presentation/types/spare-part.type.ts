import { ObjectType, Field, ID } from "@nestjs/graphql";
import { MachineType } from "src/modules/catalogs/machines/presentation/types";

@ObjectType('SparePart')
export class SparePartType {
    @Field(() => ID) id: string;
    @Field(() => ID) machineId: string;
    @Field(() => MachineType) machine: MachineType;
    @Field() partNumber: string;
    @Field({ nullable: true }) brand?: string;
    @Field({ nullable: true }) model?: string;
    @Field({ nullable: true }) supplier?: string;
    @Field({ nullable: true }) unitOfMeasure?: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
