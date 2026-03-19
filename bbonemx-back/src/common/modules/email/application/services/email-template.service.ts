import { Injectable } from '@nestjs/common';
import {
  BaseEmailTemplateData,
  MaterialRequestEmailTemplateData,
  MaterialRequestEmailItemData,
} from '../../presentation/types';

@Injectable()
export class EmailTemplateService {
  renderBaseTemplate(data: BaseEmailTemplateData): string {
    const appName = data.appName ?? 'Bumble Bee Maintenance';
    const footerText =
      data.footerText ??
      `Este correo fue enviado automáticamente por ${appName}.`;

    return `
            <div style="background-color:#f8fafc;padding:24px;font-family:Arial,sans-serif;color:#0f172a;">
                <table role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
                    <tr>
                        <td>
                            <p style="margin:0;color:#64748b;font-size:14px;">${appName}</p>
                            <h1 style="margin:12px 0 16px;font-size:24px;color:#0f172a;">${data.title}</h1>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#334155;">${data.message}</p>
                            ${this.renderActionButton(data.actionText, data.actionUrl)}
                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
                            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">${footerText}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
  }

  renderMaterialRequestTemplate(data: MaterialRequestEmailTemplateData): string {
    const appName = 'Bumble Bee Maintenance';

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:24px 8px;">
<tr><td align="center">
<table role="presentation" width="700" cellpadding="0" cellspacing="0" style="max-width:700px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">

  <!-- Header -->
  <tr>
    <td style="background-color:#8b1a1a;padding:20px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:11px;color:#fca5a5;text-transform:uppercase;letter-spacing:1px;">${appName}</p>
            <h1 style="margin:4px 0 0;font-size:20px;color:#ffffff;font-weight:700;">SOLICITUD DE MATERIAL</h1>
          </td>
          <td align="right" style="vertical-align:middle;">
            <p style="margin:0 0 4px;font-size:11px;color:#fca5a5;text-align:right;">${data.createdAt}</p>
            <span style="display:inline-block;background:#ffffff;color:#8b1a1a;font-size:14px;font-weight:700;padding:6px 14px;border-radius:6px;font-family:monospace;">${data.folio}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${this.renderCustomMessage(data.customMessage)}

  <!-- Información de la solicitud -->
  <tr>
    <td style="padding:0 24px;">
      ${this.renderSectionHeader('Información de la solicitud')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${this.renderInfoRow('Solicitante', data.requesterName + (data.requesterEmployeeNumber ? ` (${data.requesterEmployeeNumber})` : ''))}
        ${this.renderInfoRow('Qué solicita', data.category)}
        ${this.renderInfoRow('Prioridad', data.priority)}
        ${this.renderInfoRow('Importancia', data.importance)}
        ${this.renderInfoRow('Jefe a cargo', data.boss)}
      </table>
    </td>
  </tr>

  <!-- Equipo -->
  <tr>
    <td style="padding:0 24px;">
      ${this.renderSectionHeader('Datos del equipo/estructura al que se solicita refacción o servicio')}
      ${data.derivedAreaName ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">${this.renderInfoRow('Área', data.derivedAreaName)}</table>` : ''}
      ${data.machines.map((m) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <tr><td style="padding:8px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${this.renderInfoRow('Equipo', m.name)}
            ${this.renderInfoRow('Marca', m.brand ?? 'N/A')}
            ${this.renderInfoRow('Modelo', m.model ?? 'N/A')}
            ${m.manufacturer ? this.renderInfoRow('Fabricante', m.manufacturer) : ''}
          </table>
        </td></tr>
      </table>`).join('')}
    </td>
  </tr>

  ${this.renderItemsTable(data.items)}

  ${this.renderObservations(data)}

  <!-- Footer -->
  <tr>
    <td style="padding:16px 24px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
        Este correo fue enviado automáticamente por ${appName}. No responder a este correo.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
  }

  private renderCustomMessage(message?: string): string {
    if (!message?.trim()) return '';
    const escaped = message.replace(/\n/g, '<br/>');
    return `
  <tr>
    <td style="padding:20px 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:14px 16px;">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0369a1;text-transform:uppercase;">Mensaje</p>
            <p style="margin:0;font-size:14px;line-height:1.5;color:#0c4a6e;">${escaped}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }

  private renderSectionHeader(title: string): string {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr>
          <td style="background-color:#8b1a1a;padding:8px 12px;border-radius:4px;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">${title}</p>
          </td>
        </tr>
      </table>`;
  }

  private renderInfoRow(label: string, value: string): string {
    return `
        <tr>
          <td width="40%" style="padding:6px 12px;font-size:13px;font-weight:600;color:#475569;border-bottom:1px solid #f1f5f9;vertical-align:top;">${label}</td>
          <td style="padding:6px 12px;font-size:13px;color:#0f172a;border-bottom:1px solid #f1f5f9;vertical-align:top;">${value}</td>
        </tr>`;
  }

  private renderItemsDetail(items: MaterialRequestEmailItemData[]): string {
    if (items.length === 0) return '';

    const rows = items.map((item) => {
      const name = item.description || item.customName || 'Sin descripción';
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="background-color:#f8fafc;padding:8px 12px;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Artículo ${item.index}</span>
            <span style="float:right;font-size:13px;font-weight:700;color:#8b1a1a;">&times;${item.requestedQuantity ?? 0} ${item.unitOfMeasure ?? ''}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${this.renderInfoRow('Descripción/Especificaciones', name)}
              ${this.renderInfoRow('Marca', item.brand ?? 'N/A')}
              ${this.renderInfoRow('Modelo', item.model ?? 'N/A')}
              ${item.partNumber ? this.renderInfoRow('Núm. Parte del fabricante', item.partNumber) : ''}
              ${item.sku ? this.renderInfoRow('SKU', item.sku) : ''}
              ${item.proposedMinStock != null || item.proposedMaxStock != null
                ? this.renderInfoRow('Max-Min', `${item.proposedMaxStock ?? 'N/A'} / ${item.proposedMinStock ?? 'N/A'}`)
                : ''}
            </table>
          </td>
        </tr>
      </table>`;
    });

    return `
  <tr>
    <td style="padding:0 24px;">
      ${this.renderSectionHeader('Datos de la refacción/servicio que se solicita')}
      <div style="margin-bottom:20px;">
        ${rows.join('')}
      </div>
    </td>
  </tr>`;
  }

  private renderItemsTable(items: MaterialRequestEmailItemData[]): string {
    if (items.length === 0) return '';

    const hd = 'background-color:#8b1a1a;padding:8px 10px;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;border-right:1px solid #a03030;';

    const rows = items.map((item, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const name = item.description || item.customName || '-';
      const type = item.type ?? '';
      const cell = `padding:8px 10px;font-size:12px;border-bottom:1px solid #f1f5f9;`;
      return `
              <tr style="background-color:${bg};">
                <td style="${cell}color:#64748b;text-align:center;">${type}</td>
                <td style="${cell}color:#64748b;">${item.sku ?? '-'}</td>
                <td style="${cell}color:#0f172a;">${name}</td>
                <td style="${cell}color:#64748b;">${item.brand ?? '-'}</td>
                <td style="${cell}color:#64748b;">${item.model ?? '-'}</td>
                <td style="${cell}color:#64748b;">${item.partNumber ?? '-'}</td>
                <td style="${cell}color:#0f172a;text-align:center;font-weight:600;">${item.requestedQuantity ?? '-'}</td>
                <td style="${cell}color:#64748b;text-align:center;">${item.unitOfMeasure ?? '-'}</td>
                <td style="${cell}color:#64748b;text-align:center;">${item.isGenericAllowed ? 'Sí' : 'No'}</td>
              </tr>`;
    });

    return `
  <tr>
    <td style="padding:0 24px 20px;">
      ${this.renderSectionHeader('Resumen de artículos')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="${hd}text-align:center;">Tipo</td>
          <td style="${hd}">SKU</td>
          <td style="${hd}">Descripción</td>
          <td style="${hd}">Marca</td>
          <td style="${hd}">Modelo</td>
          <td style="${hd}">No. Parte</td>
          <td style="${hd}text-align:center;">Cantidad</td>
          <td style="${hd}text-align:center;">U.M.</td>
          <td style="${hd}text-align:center;border-right:none;">Genérico</td>
        </tr>
        ${rows.join('')}
      </table>
    </td>
  </tr>`;
  }

  private renderObservations(data: MaterialRequestEmailTemplateData): string {
    if (!data.description && !data.justification && !data.comments && !data.suggestedSupplier) return '';

    let rows = '';
    if (data.description) {
      rows += this.renderInfoRow('Descripción/Especificaciones', data.description);
    }
    if (data.justification) {
      rows += this.renderInfoRow('Justificante', data.justification);
    }
    if (data.comments) {
      rows += this.renderInfoRow('Comentarios', data.comments);
    }
    if (data.suggestedSupplier) {
      rows += this.renderInfoRow('Proveedor sugerido', data.suggestedSupplier);
    }

    return `
  <tr>
    <td style="padding:0 24px 20px;">
      ${this.renderSectionHeader('Observaciones')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </td>
  </tr>`;
  }

  private renderActionButton(actionText?: string, actionUrl?: string): string {
    if (!actionText || !actionUrl) return '';

    return `
            <a href="${actionUrl}" style="display:inline-block;background:#2565eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600;">
                ${actionText}
            </a>
        `;
  }
}
