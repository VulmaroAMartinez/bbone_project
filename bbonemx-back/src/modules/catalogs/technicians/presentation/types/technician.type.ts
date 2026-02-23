import { ObjectType, Field, ID } from "@nestjs/graphql";
import { UserType } from "src/modules/users/presentation/types";
import { PositionType } from "src/modules/catalogs/positions/presentation/types";

@ObjectType('Technician')
export class TechnicianType {
    @Field(() => ID) id: string;
    @Field(() => UserType) user: UserType;
    @Field({ nullable: true }) rfc?: string;
    @Field({ nullable: true }) nss?: string;
    @Field() bloodType: string;
    @Field() allergies: string;
    @Field() emergencyContactName: string;
    @Field() emergencyContactPhone: string;
    @Field() emergencyContactRelationship: string;
    @Field() birthDate: Date;
    @Field() address: string;
    @Field() education: string;
    @Field() childrenCount: number;
    @Field() shirtSize: string;
    @Field() pantsSize: string;
    @Field() shoeSize: string;
    @Field() transportRoute: string;
    @Field() hireDate: Date;
    @Field() vacationPeriod: number;
    @Field(() => PositionType) position: PositionType;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
    @Field() deletedAt?: Date;
    @Field() createdBy?: string;
    @Field() updatedBy?: string;
}