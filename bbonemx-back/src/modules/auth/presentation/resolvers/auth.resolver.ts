import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../application/services';
import { CurrentUser, JwtAuthGuard, Public } from 'src/common';
import { LoginInput, LoginResponse } from '../../application/dto';
import { UseGuards } from '@nestjs/common';
import type { IGqlContext } from 'src/common/types';
import { UserType } from 'src/modules/users/presentation/types';
import { User } from 'src/modules/users/domain/entities';
import { Context } from '@nestjs/graphql';
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '../../application/utils/auth-cookies.util';

function readUserAgent(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Inicia sesión con número de empleado y contraseña',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: unknown,
  ): Promise<LoginResponse> {
    const gqlContext = context as IGqlContext;
    const user = await this.authService.authenticateUser(
      input.employeeNumber,
      input.password,
      gqlContext.req?.ip,
    );
    const session = await this.authService.createSession(user, {
      ipAddress: gqlContext.req?.ip,
      userAgent: readUserAgent(gqlContext.req?.headers['user-agent']),
    });

    setAuthCookies(gqlContext.res, this.configService, session);
    return this.authService.login(session.user);
  }

  @Public()
  @Mutation(() => Boolean, {
    description: 'Renueva sesión con refresh token rotativo en cookie HttpOnly',
  })
  async refreshAuth(@Context() context: unknown): Promise<boolean> {
    const gqlContext = context as IGqlContext;
    const refreshToken = gqlContext.req?.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return false;
    }

    const session = await this.authService.refreshSession(refreshToken, {
      ipAddress: gqlContext.req?.ip,
      userAgent: readUserAgent(gqlContext.req?.headers['user-agent']),
    });

    setAuthCookies(gqlContext.res, this.configService, session);
    return true;
  }

  @Public()
  @Mutation(() => Boolean, {
    description: 'Cierra sesión y limpia cookies de autenticación',
  })
  async logout(@Context() context: unknown): Promise<boolean> {
    const gqlContext = context as IGqlContext;
    const refreshToken = gqlContext.req?.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.revokeRefreshToken(refreshToken);
    clearAuthCookies(gqlContext.res, this.configService);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserType, {
    description: 'Obtiene el usuario actualmente autenticado',
  })
  async me(@CurrentUser() user: User): Promise<UserType> {
    return user;
  }
}
