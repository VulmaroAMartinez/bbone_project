import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/modules/users/application/services";
import { PasswordService } from "src/common/services";
import { User } from "src/modules/users/domain/entities";
import { LoginResponse } from "../dto";

export interface JwtPayload {
    sub: string;
    employeeNumber: string;
    roleId: string;
    roleName: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
    ) {}

    async validateUser(employeeNumber: string, password: string): Promise<User | null> {
        this.logger.debug(`Validando usuario: ${employeeNumber}`);
        const user = await this.usersService.findByEmployeeNumber(employeeNumber);

        if(!user) {
            this.logger.warn(`Usuario no encontrado: ${employeeNumber}`);
            return null;
        }

        if (!user.isActive) {
            this.logger.warn(`Usuario incorrecto: ${employeeNumber}`);
            return null;
        }

        const isPasswordValid = await this.passwordService.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Contraseña incorrecta: ${employeeNumber}`);
            return null;
        }

        this.logger.log(`Usuario validado: ${employeeNumber}`);
        return user;
    }

    async login(user: User): Promise<LoginResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            employeeNumber: user.employeeNumber,
            roleId: user.roleId,
            roleName: user.role?.name || '',
        };

        const accessToken = this.jwtService.sign(payload);
        this.logger.log('Usuario logueado');

        return {
            accessToken,
            user,
        };
    }

    async authenticate(employeeNumber: string, password: string): Promise<LoginResponse> {
        const user = await this.validateUser(employeeNumber, password);
        if (!user) throw new UnauthorizedException('Credenciales incorrectas');
        return this.login(user);
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.usersService.findById(userId);
    }
}