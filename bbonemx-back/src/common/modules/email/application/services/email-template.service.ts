import { Injectable } from "@nestjs/common";
import { BaseEmailTemplateData } from "../../presentation/types";

@Injectable()
export class EmailTemplateService {
    renderBaseTemplate(data: BaseEmailTemplateData): string {
        const appName = data.appName ?? 'Bumble Bee Maintenance';
        const footerText =
            data.footerText ??
                `Este correo fue enviado automáticamente por ${appName}.`;

        return `
            <div style="background-color:#f8fafc;padding:24px;font-family:Arial,sans-serif;color:#0f172a;>
                <table role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;
                    <tr>
                        <td>
                            <p style="margin:0;color:#64748b;font-size:14px;">${appName}</p>
                            <h1 style="margin:12px 0 16px;font-size:24px;color:#of172a;">${data.title}</h1>
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

    private renderActionButton(actionText?: string, actionUrl?: string): string {
        if (!actionText || !actionUrl) return '';

        return `
            <a href="${actionUrl}" style="display:inline-block;background:#2565eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600;">
                ${actionText}
            </a>
        `;
    }
}