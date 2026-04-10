export interface BaseEmailTemplateData {
  appName?: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  footerText?: string;
}

export interface EmailAttachment {
  filename: string;
  path?: string;
  cid?: string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  attachments?: EmailAttachment[];
  template?: {
    data: BaseEmailTemplateData;
  };
}

export interface MaterialRequestEmailItemData {
  index: number;
  type?: string;
  description?: string;
  customName?: string;
  sku?: string;
  partNumber?: string;
  brand?: string;
  model?: string;
  unitOfMeasure?: string;
  requestedQuantity?: number;
  proposedMaxStock?: number;
  proposedMinStock?: number;
  isGenericAllowed?: boolean;
}

export interface MaterialRequestEmailMachineData {
  name: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  areaName?: string;
  subAreaName?: string;
}

export interface TechnicianBirthdayEmailRowData {
  fullName: string;
  employeeNumber?: string;
  birthdayThisWeekLabel: string;
  positionName?: string;
}

export interface TechnicianBirthdaysWeeklyTemplateData {
  weekTitle: string;
  introMessage: string;
  birthdays: TechnicianBirthdayEmailRowData[];
}

export interface MaterialRequestEmailPhotoData {
  cid: string;
  fileName: string;
}

export interface MaterialRequestEmailTemplateData {
  folio: string;
  createdAt: string;
  requesterName: string;
  requesterEmployeeNumber?: string;
  boss: string;
  category: string;
  priority: string;
  importance: string;
  derivedAreaName?: string;
  machines: MaterialRequestEmailMachineData[];
  description?: string;
  justification?: string;
  comments?: string;
  suggestedSupplier?: string;
  customMessage?: string;
  items: MaterialRequestEmailItemData[];
  photos?: MaterialRequestEmailPhotoData[];
}
