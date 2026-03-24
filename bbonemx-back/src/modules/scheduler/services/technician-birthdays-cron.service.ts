import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TechnicianBirthdaysNotificationService } from './technician-birthdays-notification.service';

@Injectable()
export class TechnicianBirthdaysCronService implements OnModuleInit {
  private readonly logger = new Logger(TechnicianBirthdaysCronService.name);
  private readonly jobName = 'technician-birthdays-weekly-email';
  private isEnabled: boolean;
  private cronExpression: string;
  private timeZone: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: TechnicianBirthdaysNotificationService,
  ) {
    this.isEnabled = this.configService.get<boolean>(
      'scheduler.jobs.technicianBirthdays.enabled',
      false,
    );
    this.cronExpression = this.configService.get<string>(
      'scheduler.jobs.technicianBirthdays.cron',
      '0 8 * * 1',
    );
    this.timeZone = this.configService.get<string>(
      'scheduler.jobs.technicianBirthdays.timeZone',
      'America/Mexico_City',
    );
  }

  onModuleInit() {
    if (!this.isEnabled) return;

    try {
      const job = new CronJob(
        this.cronExpression,
        () => {
          void this.handleCron();
        },
        null,
        true,
        this.timeZone,
      );

      this.schedulerRegistry.addCronJob(this.jobName, job);
      this.logger.log(
        `Technician birthdays cron started: ${this.cronExpression} (${this.timeZone})`,
      );
    } catch (error) {
      this.logger.error(
        `Error starting technician birthdays cron: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async handleCron() {
    this.logger.log('Ejecutando notificación semanal de cumpleaños de técnicos...');
    try {
      await this.notificationService.sendWeeklyDigestIfAny(this.timeZone);
    } catch (error) {
      this.logger.error(
        `Notificación de cumpleaños falló: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async runManually() {
    this.logger.log('Ejecutando notificación de cumpleaños (manual)...');
    return this.notificationService.sendWeeklyDigestIfAny(this.timeZone);
  }

  getStatus(): {
    enabled: boolean;
    cronExpression: string;
    timeZone: string;
    nextRunAt: Date | null;
  } {
    let nextRun: Date | null = null;
    try {
      const job = this.schedulerRegistry.getCronJob(this.jobName);
      if (job) {
        nextRun = job.nextDate().toJSDate();
      }
    } catch {
      // Job no registrado
    }

    return {
      enabled: this.isEnabled,
      cronExpression: this.cronExpression,
      timeZone: this.timeZone,
      nextRunAt: nextRun,
    };
  }

  pause(): void {
    try {
      const job = this.schedulerRegistry.getCronJob(this.jobName);
      job.stop();
      this.logger.log('Technician birthdays cron pausado');
    } catch (error) {
      this.logger.error(
        `No se pudo pausar technician birthdays cron: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  resume(): void {
    try {
      const job = this.schedulerRegistry.getCronJob(this.jobName);
      job.start();
      this.logger.log('Technician birthdays cron reanudado');
    } catch (error) {
      this.logger.error(
        `No se pudo reanudar technician birthdays cron: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
