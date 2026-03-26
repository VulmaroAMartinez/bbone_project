import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('healthz')
  healthz() {
    return {
      status: 'ok',
      service: this.configService.get<string>('app.name') ?? 'backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  readyz() {
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }
}
