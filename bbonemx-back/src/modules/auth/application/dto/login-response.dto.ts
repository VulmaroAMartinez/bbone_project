import { Field, ObjectType } from "@nestjs/graphql";
import { UserType } from "src/modules/users/presentation/types";

@ObjectType()
export class LoginResponse {
    @Field()
    accessToken: string;

    @Field(() => UserType)
    user: UserType;
}