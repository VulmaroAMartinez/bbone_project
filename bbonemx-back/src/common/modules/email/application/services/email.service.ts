import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { emailConfig } from 'src/config';
import { EmailTemplateService } from './email-template.service';
import { SendEmailOptions } from '../../presentation/types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @Inject(emailConfig.KEY)
    private readonly config: ConfigType<typeof emailConfig>,
    private readonly templateService: EmailTemplateService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.transport.host,
      port: this.config.transport.port,
      secure: this.config.transport.secure,
      auth: this.config.transport.user
        ? {
            user: this.config.transport.user,
            pass: this.config.transport.pass,
          }
        : undefined,
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (!this.config.enabled) {
      this.logger.warn('Email disabled in configuration');
      return;
    }

    const html = options.html ?? this.resolveTemplate(options);

    try {
      await this.transporter.sendMail({
        from: options.from ?? this.buildDefaultFrom(),
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html,
        attachments: options.attachments,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private resolveTemplate(options: SendEmailOptions): string | undefined {
    if (!options.template) return undefined;

    return this.templateService.renderBaseTemplate(options.template.data);
  }

  private buildDefaultFrom(): string {
    const { name, address } = this.config.defaultFrom;
    return `${name} <${address}>`;
  }
}
