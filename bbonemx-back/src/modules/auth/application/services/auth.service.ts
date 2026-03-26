import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { StringValue } from 'ms';
import { UsersService } from 'src/modules/users/application/services';
import { PasswordService } from 'src/common/services';
import { User } from 'src/modules/users/domain/entities';
import { IsNull, Repository } from 'typeorm';
import { LoginResponse } from '../dto';
import { RefreshToken } from '../../infrastructure/entities';

export interface JwtPayload {
  sub: string;
  employeeNumber: string;
  roleIds: string[];
  roleNames: string[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: User;
  accessTokenMaxAgeMs: number;
  refreshTokenMaxAgeMs: number;
}

interface AuthRequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxAttempts = Number(process.env.AUTH_MAX_ATTEMPTS ?? 5);
  private readonly lockoutMinutes = Number(
    process.env.AUTH_LOCKOUT_MINUTES ?? 15,
  );
  private readonly failedAttempts = new Map<
    string,
    { count: number; lockedUntil?: Date }
  >();
  private readonly accessTokenTtl: StringValue;
  private readonly refreshTokenTtl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {
    this.accessTokenTtl = (this.configService.get<string>(
      'jwt.accessTokenTtl',
    ) || '15m') as StringValue;
    this.refreshTokenTtl = this.configService.get<string>('jwt.refreshTokenTtl') || '7d';
  }

  private getLockKey(employeeNumber: string, source?: string): string {
    return `${employeeNumber}:${source ?? 'unknown'}`;
  }

  private assertNotLocked(lockKey: string): void {
    const attempts = this.failedAttempts.get(lockKey);
    if (!attempts?.lockedUntil) return;

    if (attempts.lockedUntil > new Date()) {
      throw new HttpException(
        'Cuenta temporalmente bloqueada por intentos fallidos',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.failedAttempts.delete(lockKey);
  }

  private registerFailedAttempt(lockKey: string): void {
    const current = this.failedAttempts.get(lockKey);
    const nextCount = (current?.count ?? 0) + 1;

    if (nextCount >= this.maxAttempts) {
      const lockedUntil = new Date(
        Date.now() + this.lockoutMinutes * 60 * 1000,
      );
      this.failedAttempts.set(lockKey, { count: nextCount, lockedUntil });
      return;
    }

    this.failedAttempts.set(lockKey, { count: nextCount });
  }

  private clearFailedAttempts(lockKey: string): void {
    this.failedAttempts.delete(lockKey);
  }

  async validateUser(
    employeeNumber: string,
    password: string,
    source?: string,
  ): Promise<User | null> {
    const lockKey = this.getLockKey(employeeNumber, source);
    this.assertNotLocked(lockKey);

    this.logger.debug(`Validando usuario: ${employeeNumber}`);
    const user = await this.usersService.findByEmployeeNumber(employeeNumber);

    if (!user) {
      this.logger.warn(`Usuario no encontrado: ${employeeNumber}`);
      this.registerFailedAttempt(lockKey);
      return null;
    }

    if (!user.isActive) {
      this.logger.warn(`Usuario incorrecto: ${employeeNumber}`);
      this.registerFailedAttempt(lockKey);
      return null;
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );
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
    const accessToken = this.issueAccessToken(user);
    this.logger.log('Usuario logueado');

    return {
      accessToken,
      user,
    };
  }

  private ttlToMs(ttl: string): number {
    const normalized = ttl.trim().toLowerCase();
    const match = normalized.match(/^(\d+)([smhd])$/);
    if (!match) {
      const asNumber = Number(normalized);
      if (Number.isFinite(asNumber) && asNumber > 0) {
        return asNumber * 1000;
      }
      throw new Error(`Formato de TTL inválido: ${ttl}`);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const unitMsMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * unitMsMap[unit];
  }

  private hashRefreshToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private buildJwtPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      employeeNumber: user.employeeNumber,
      roleIds: user.roles?.map((role) => role.id) ?? [],
      roleNames: user.roles?.map((role) => role.name) ?? [],
    };
  }

  issueAccessToken(user: User): string {
    const payload: JwtPayload = {
      ...this.buildJwtPayload(user),
    };
    return this.jwtService.sign(payload, { expiresIn: this.accessTokenTtl });
  }

  private async issueRefreshToken(
    userId: string,
    metadata?: AuthRequestMetadata,
    rotatedFromTokenId?: string,
  ): Promise<{ token: string; maxAgeMs: number }> {
    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashRefreshToken(token);
    const maxAgeMs = this.ttlToMs(this.refreshTokenTtl);
    const expiresAt = new Date(Date.now() + maxAgeMs);

    const refreshToken = this.refreshTokensRepository.create({
      userId,
      tokenHash,
      expiresAt,
      rotatedFromTokenId: rotatedFromTokenId ?? null,
      ipAddress: metadata?.ipAddress ?? null,
      userAgent: metadata?.userAgent ?? null,
    });

    await this.refreshTokensRepository.save(refreshToken);
    return { token, maxAgeMs };
  }

  async createSession(
    user: User,
    metadata?: AuthRequestMetadata,
  ): Promise<AuthSession> {
    const accessToken = this.issueAccessToken(user);
    const refresh = await this.issueRefreshToken(user.id, metadata);
    const csrfToken = randomBytes(24).toString('hex');

    return {
      accessToken,
      refreshToken: refresh.token,
      csrfToken,
      user,
      accessTokenMaxAgeMs: this.ttlToMs(String(this.accessTokenTtl)),
      refreshTokenMaxAgeMs: refresh.maxAgeMs,
    };
  }

  async refreshSession(
    rawRefreshToken: string,
    metadata?: AuthRequestMetadata,
  ): Promise<AuthSession> {
    const hashedToken = this.hashRefreshToken(rawRefreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: {
        tokenHash: hashedToken,
        revokedAt: IsNull(),
        isActive: true,
      },
      relations: ['user'],
    });

    if (!storedToken) throw new UnauthorizedException('Refresh token inválido');
    

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      storedToken.revokedAt = new Date();
      storedToken.isActive = false;
      await this.refreshTokensRepository.save(storedToken);
      throw new UnauthorizedException('Refresh token expirado');
    }

    const user =
      storedToken.user ??
      (await this.usersService.findById(storedToken.userId));
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inválido');
    }

    storedToken.revokedAt = new Date();
    storedToken.isActive = false;
    await this.refreshTokensRepository.save(storedToken);

    const newRefresh = await this.issueRefreshToken(
      user.id,
      metadata,
      storedToken.id,
    );
    const csrfToken = randomBytes(24).toString('hex');

    return {
      accessToken: this.issueAccessToken(user),
      refreshToken: newRefresh.token,
      csrfToken,
      user,
      accessTokenMaxAgeMs: this.ttlToMs(String(this.accessTokenTtl)),
      refreshTokenMaxAgeMs: newRefresh.maxAgeMs,
    };
  }

  async revokeRefreshToken(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const hashedToken = this.hashRefreshToken(rawRefreshToken);
    const token = await this.refreshTokensRepository.findOne({
      where: { tokenHash: hashedToken, revokedAt: IsNull(), isActive: true },
    });

    if (!token) return;
    token.revokedAt = new Date();
    token.isActive = false;
    await this.refreshTokensRepository.save(token);
  }

  async authenticateUser(
    employeeNumber: string,
    password: string,
    source?: string,
  ): Promise<User> {
    const user = await this.validateUser(employeeNumber, password, source);
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
