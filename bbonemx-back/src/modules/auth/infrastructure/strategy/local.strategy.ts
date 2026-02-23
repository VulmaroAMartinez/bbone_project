import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../../application/services";
import { User } from "src/modules/users/domain/entities";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService){
        super({
            usernameField: 'employeeNumber',
            passwordField: 'password',
        });
    }

    async validate(employeeNumber: string, password: string): Promise<User> {
        const user = await this.authService.validateUser(employeeNumber, password);
        if(!user) throw new UnauthorizedException('Credenciales incorrectas');
        return user;
    }
}