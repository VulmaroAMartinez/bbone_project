export interface BaseEmailTemplateData {
  appName?: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  footerText?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  template?: {
    data: BaseEmailTemplateData;
  };
}
