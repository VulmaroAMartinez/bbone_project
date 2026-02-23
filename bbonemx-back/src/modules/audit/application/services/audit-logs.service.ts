import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';

/**
 * Opciones de filtrado para consultas de auditoría.
 */
export interface AuditLogFilterOptions {
  tableName?: string;
  recordId?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

/**
 * Servicio para consultar y gestionar los logs de auditoría.
 * Este servicio NO crea logs directamente - eso lo hace el AuditSubscriber.
 */
@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Obtiene los logs de auditoría con filtros opcionales.
   */
  async findAll(options: AuditLogFilterOptions = {}): Promise<AuditLog[]> {
    const {
      tableName,
      recordId,
      userId,
      action,
      startDate,
      endDate,
      ipAddress,
      limit = 50,
      offset = 0,
    } = options;

    const where: FindOptionsWhere<AuditLog> = {};

    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (ipAddress) where.ipAddress = ipAddress;

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Obtiene el historial de cambios de un registro específico.
   */
  async getRecordHistory(
    tableName: string,
    recordId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tableName, recordId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene todas las acciones realizadas por un usuario.
   */
  async getUserActivity(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<AuditLog[]> {
    const { limit = 50, offset = 0 } = options;

    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Obtiene un log de auditoría por su ID.
   */
  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  /**
   * Cuenta los logs de auditoría con filtros opcionales.
   */
  async count(options: AuditLogFilterOptions = {}): Promise<number> {
    const { tableName, recordId, userId, action, startDate, endDate } = options;

    const where: FindOptionsWhere<AuditLog> = {};

    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return this.auditLogRepository.count({ where });
  }
}
