import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AuthService } from "../../application/services";
import { CurrentUser, JwtAuthGuard, Public } from "src/common";
import { LoginInput, LoginResponse } from "../../application/dto";
import { UseGuards } from "@nestjs/common";
import { UserType } from "src/modules/users/presentation/types";
import { User } from "src/modules/users/domain/entities";

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Mutation(() => LoginResponse, {
        description: 'Inicia sesión con número de empleado y contraseña',
    })
    async login(
        @Args('input') input: LoginInput
    ): Promise<LoginResponse> {
        return this.authService.authenticate(input.employeeNumber, input.password);
    }

    @UseGuards(JwtAuthGuard)
    @Query(() => UserType, {
        description: 'Obtiene el usuario actualmente autenticado'
    })
    async me(@CurrentUser() user: User): Promise<UserType> {
        return user;
    }


}