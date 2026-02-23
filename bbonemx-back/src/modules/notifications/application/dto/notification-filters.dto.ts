import { InputType, Field, Int } from "@nestjs/graphql";
import { NotificationType } from "src/common";
import { IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from "class-validator";

@InputType()
export class NotificationFiltersInput {
    @Field(() => NotificationType, { nullable: true, description: 'Filtrar por tipo' })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @Field({ nullable: true, description: 'Solo no leídas' })
    @IsOptional()
    @IsBoolean()
    unreadOnly?: boolean;
}

@InputType()
export class NotificationPaginationInput {
    @Field(() => Int, { defaultValue: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @Field(() => Int, { defaultValue: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}
