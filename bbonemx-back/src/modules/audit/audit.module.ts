import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './domain/entities/audit-log.entity';
import { AuditLogsService } from './application/services/audit-logs.service';
import { AuditSubscriber } from './infrastructure/subscribers/audit.subscriber';

/**
 * Módulo de auditoría.
 * 
 * Proporciona:
 * - Registro automático de cambios en entidades mediante AuditSubscriber
 * - Servicio para consultar logs de auditoría
 * 
 * Este módulo es global para que el AuditSubscriber esté disponible
 * en toda la aplicación.
 * 
 * IMPORTANTE: El UserContextInterceptor debe estar registrado globalmente
 * en app.module.ts para que el contexto del usuario esté disponible.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogsService, AuditSubscriber],
  exports: [AuditLogsService],
})
export class AuditModule {}
