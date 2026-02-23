import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService, JwtPayload } from "../../application/services";
import { User } from "src/modules/users/domain/entities";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('jwt.secret'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.getUserById(payload.sub);
        if(!user) throw new UnauthorizedException('Usuario no encontrado');
        if(!user.isActive) throw new UnauthorizedException('Usuario inactivo');
        if(user.roleId !== payload.roleId) throw new UnauthorizedException('Usuario no autorizado');
        return user;
    }
}