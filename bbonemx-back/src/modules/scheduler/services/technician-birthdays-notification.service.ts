import { Injectable, Logger } from '@nestjs/common';
import { TechniciansRepository } from 'src/modules/catalogs/technicians/infrastructure/repositories';
import { UsersRepository } from 'src/modules/users/infrastructure/persistence/repositories';
import { EmailService } from 'src/common/modules/email/application/services/email.service';
import { EmailTemplateService } from 'src/common/modules/email/application/services/email-template.service';
import { Role as RoleEnum } from 'src/common/enums/role.enum';
import { Technician } from 'src/modules/catalogs/technicians/domain/entities';
import {
  addCalendarDays,
  formatSpanishDayMonth,
  formatSpanishWeekRangeTitle,
  getMondayToSundayWeekInTimeZone,
  toMonthDayKey,
  type CalendarYmd,
} from 'src/common/utils/technician-birthday-week.util';

export interface WeeklyBirthdaysEmailOutcome {
  sent: boolean;
  birthdayCount: number;
  recipientCount: number;
  reason?: string;
}

@Injectable()
export class TechnicianBirthdaysNotificationService {
  private readonly logger = new Logger(
    TechnicianBirthdaysNotificationService.name,
  );

  constructor(
    private readonly techniciansRepository: TechniciansRepository,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  /**
   * Envía un correo a administradores si hay cumpleaños de técnicos activos en la semana
   * (lunes–domingo) según la zona horaria indicada.
   */
  async sendWeeklyDigestIfAny(
    timeZone: string,
  ): Promise<WeeklyBirthdaysEmailOutcome> {
    const now = new Date();
    const { monthDayKeys, weekStart, weekEnd } =
      getMondayToSundayWeekInTimeZone(now, timeZone);

    const technicians =
      await this.techniciansRepository.findActiveWithBirthdaysOnMonthDays(
        monthDayKeys,
      );

    if (technicians.length === 0) {
      this.logger.log(
        `Cumpleaños semanales (${timeZone}): sin cumpleaños en la semana; no se envía correo.`,
      );
      return {
        sent: false,
        birthdayCount: 0,
        recipientCount: 0,
        reason: 'no_birthdays',
      };
    }

    const recipients = await this.usersRepository.findActiveEmailsByRoleName(
      RoleEnum.ADMIN,
    );

    if (recipients.length === 0) {
      this.logger.warn(
        'Cumpleaños semanales: no hay administradores con correo; no se envía correo.',
      );
      return {
        sent: false,
        birthdayCount: technicians.length,
        recipientCount: 0,
        reason: 'no_recipients',
      };
    }

    const weekTitle = formatSpanishWeekRangeTitle(weekStart, weekEnd);
    const birthdays = technicians.map((t) =>
      this.mapTechnicianToRow(t, weekStart),
    );

    const html =
      this.emailTemplateService.renderTechnicianBirthdaysWeeklyTemplate({
        weekTitle,
        introMessage: `Esta semana cumplen años ${technicians.length} técnico(s).`,
        birthdays,
      });

    await this.emailService.send({
      to: recipients,
      subject: `Cumpleaños de técnicos — ${weekTitle}`,
      html,
    });

    this.logger.log(
      `Cumpleaños semanales: correo enviado a ${recipients.length} administrador(es); ${technicians.length} cumpleaño(s).`,
    );

    return {
      sent: true,
      birthdayCount: technicians.length,
      recipientCount: recipients.length,
    };
  }

  private mapTechnicianToRow(
    technician: Technician,
    weekStart: CalendarYmd,
  ): {
    fullName: string;
    employeeNumber?: string;
    birthdayThisWeekLabel: string;
    positionName?: string;
  } {
    const birth = technician.birthDate;
    const mdKey = `${String(birth.getUTCMonth() + 1).padStart(2, '0')}-${String(birth.getUTCDate()).padStart(2, '0')}`;

    let dayInWeek: CalendarYmd | null = null;
    for (let i = 0; i < 7; i++) {
      const ymd = addCalendarDays(weekStart, i);
      if (toMonthDayKey(ymd) === mdKey) {
        dayInWeek = ymd;
        break;
      }
    }

    const birthdayThisWeekLabel = dayInWeek
      ? formatSpanishDayMonth(dayInWeek)
      : mdKey;

    const user = technician.user;
    const fullName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Sin nombre';

    return {
      fullName,
      employeeNumber: user?.employeeNumber,
      birthdayThisWeekLabel,
      positionName: technician.position?.name,
    };
  }
}
