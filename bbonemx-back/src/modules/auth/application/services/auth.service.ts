import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/modules/users/application/services";
import { PasswordService } from "src/common/services";
import { User } from "src/modules/users/domain/entities";
import { LoginResponse } from "../dto";

export interface JwtPayload {
    sub: string;
    employeeNumber: string;
    roleIds: string[];
    roleNames: string[];
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly maxAttempts = Number(process.env.AUTH_MAX_ATTEMPTS ?? 5);
    private readonly lockoutMinutes = Number(process.env.AUTH_LOCKOUT_MINUTES ?? 15);
    private readonly failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
    ) {}

    private getLockKey(employeeNumber: string, source?: string): string {
        return `${employeeNumber}:${source ?? 'unknown'}`;
    }

    private assertNotLocked(lockKey: string): void {
        const attempts = this.failedAttempts.get(lockKey);
        if (!attempts?.lockedUntil) return;

        if (attempts.lockedUntil > new Date()) {
            throw new HttpException('Cuenta temporalmente bloqueada por intentos fallidos', HttpStatus.TOO_MANY_REQUESTS);
        }

        this.failedAttempts.delete(lockKey);
    }

    private registerFailedAttempt(lockKey: string): void {
        const current = this.failedAttempts.get(lockKey);
        const nextCount = (current?.count ?? 0) + 1;

        if (nextCount >= this.maxAttempts) {
            const lockedUntil = new Date(Date.now() + this.lockoutMinutes * 60 * 1000);
            this.failedAttempts.set(lockKey, { count: nextCount, lockedUntil });
            return;
        }

        this.failedAttempts.set(lockKey, { count: nextCount });
    }

    private clearFailedAttempts(lockKey: string): void {
        this.failedAttempts.delete(lockKey);
    }

    async validateUser(employeeNumber: string, password: string, source?: string): Promise<User | null> {
        const lockKey = this.getLockKey(employeeNumber, source);
        this.assertNotLocked(lockKey);

        this.logger.debug(`Validando usuario: ${employeeNumber}`);
        const user = await this.usersService.findByEmployeeNumber(employeeNumber);

        if(!user) {
            this.logger.warn(`Usuario no encontrado: ${employeeNumber}`);
            this.registerFailedAttempt(lockKey);
            return null;
        }

        if (!user.isActive) {
            this.logger.warn(`Usuario incorrecto: ${employeeNumber}`);
            this.registerFailedAttempt(lockKey);
            return null;
        }

        const isPasswordValid = await this.passwordService.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Contraseña incorrecta: ${employeeNumber}`);
            this.registerFailedAttempt(lockKey);
            return null;
        }

        this.clearFailedAttempts(lockKey);

        this.logger.log(`Usuario validado: ${employeeNumber}`);
        return user;
    }

    async login(user: User): Promise<LoginResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            employeeNumber: user.employeeNumber,
            roleIds: user.roles?.map((role) => role.id) ?? [],
            roleNames: user.roles?.map((role) => role.name) ?? [],
        };

        const accessToken = this.jwtService.sign(payload);
        this.logger.log('Usuario logueado');

        return {
            accessToken,
            user,
        };
    }

    async authenticate(employeeNumber: string, password: string, source?: string): Promise<LoginResponse> {
        const user = await this.validateUser(employeeNumber, password, source);
        if (!user) throw new UnauthorizedException('Credenciales incorrectas');
        return this.login(user);
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.usersService.findById(userId);
    }
}
