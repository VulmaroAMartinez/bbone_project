import { ObjectType, Field, ID } from "@nestjs/graphql";
import { SubAreaType } from "src/modules/catalogs/sub-areas/presentation/types";

@ObjectType('Machine')
export class MachineType {
    @Field(() => ID) id: string;
    @Field() code: string;
    @Field() name: string;
    @Field({ nullable: true }) description?: string;
    @Field(() => ID) subAreaId: string;
    @Field(() => SubAreaType) subArea: SubAreaType;
    @Field({ nullable: true }) brand?: string;
    @Field({ nullable: true }) model?: string;
    @Field({ nullable: true }) serialNumber?: string;
    @Field({ nullable: true }) installationDate?: Date;
    @Field({ nullable: true }) machinePhotoUrl?: string;
    @Field({ nullable: true }) operationalManualUrl?: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
