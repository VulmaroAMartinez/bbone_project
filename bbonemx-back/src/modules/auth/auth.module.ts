import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./application/services";
import { JwtStrategy, LocalStrategy } from "./infrastructure/strategy";
import { AuthResolver } from "./presentation/resolvers";

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              secret: configService.get<string>('jwt.secret'),
              signOptions: {
                expiresIn: configService.get<number>('jwt.expiresIn'),
              },
            }),
          }),
        ],
    providers: [AuthService, JwtStrategy, LocalStrategy, AuthResolver],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}