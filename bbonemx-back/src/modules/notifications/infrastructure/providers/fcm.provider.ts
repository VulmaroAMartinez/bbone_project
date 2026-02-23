import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export interface FcmMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface FcmSendResult {
  token: string;
  success: boolean;
  error?: string;
}


@Injectable()
export class FcmProvider implements OnModuleInit {
  private readonly logger = new Logger(FcmProvider.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    if (admin.apps.length) {
      this.initialized = true;
      return;
    }

    try {
      const credential = this.resolveCredential();
      if (!credential) {
        this.logger.warn(
          'FCM no configurado. Opciones: ' +
          'FIREBASE_SERVICE_ACCOUNT_PATH (ruta al JSON), ' +
          'FIREBASE_SERVICE_ACCOUNT_JSON (JSON inline), o ' +
          'FCM_PROJECT_ID + FCM_CLIENT_EMAIL + FCM_PRIVATE_KEY',
        );
        return;
      }

      admin.initializeApp({ credential });
      this.initialized = true;
      this.logger.log('FCM inicializado correctamente');

    } catch (error) {
      this.logger.error('Error al inicializar FCM', error);
      throw error;
    }
  }

  private resolveCredential(): admin.credential.Credential | null {
    // Opción 1: Ruta al archivo JSON (recomendado por Firebase)
    const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
    if (serviceAccountPath) {
      const resolvedPath = path.resolve(serviceAccountPath);
      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
        this.logger.log(`Firebase credential cargado desde archivo: ${resolvedPath}`);
        return admin.credential.cert(serviceAccount);
      }
      this.logger.warn(`Archivo serviceAccount no encontrado: ${resolvedPath}`);
    }

    // Opción 2: JSON inline (útil para Docker, CI/CD, Heroku)
    const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.logger.log('Firebase credential cargado desde variable JSON inline');
      return admin.credential.cert(serviceAccount);
    }

    // Opción 3: Variables individuales (fallback)
    const projectId = this.configService.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FCM_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      this.logger.log('Firebase credential cargado desde variables individuales');
      return admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      });
    }

    return null;
  }

  async sendToToken(token: string, message: FcmMessage): Promise<FcmSendResult> {
    if (!this.initialized) {
      this.logger.warn('FCM no inicializado, push omitido');
      return { token, success: false, error: 'FCM_NOT_INITIALIZED' };
    }

    try {
      await admin.messaging().send({
        token,
        notification: {
          title: message.title,
          body: message.body,
          ...(message.imageUrl && { imageUrl: message.imageUrl }),
        },
        data: message.data,
        // Configuración para foreground y background
        android: {
          priority: 'high',
          notification: {
            channelId: 'cmms_default',
            priority: 'high',
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title: message.title, body: message.body },
              sound: 'default',
              badge: 1,
              'content-available': 1, 
            },
          },
        },
        webpush: {
          notification: {
            title: message.title,
            body: message.body,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            requireInteraction: true,
          },
          fcmOptions: {
            link: message.data?.['link'] || '/',
          },
        },
      });

      return { token, success: true };
    } catch (error: any) {
      const errorCode = error?.code || error?.message || 'UNKNOWN';
      this.logger.error(`Error enviando push a token ${token.substring(0, 20)}...`, errorCode);

      return { token, success: false, error: errorCode };
    }
  }

  async sendToTokens(tokens: string[], message: FcmMessage): Promise<FcmSendResult[]> {
    if (!this.initialized || tokens.length === 0) {
      return tokens.map(t => ({ token: t, success: false, error: 'FCM_NOT_INITIALIZED' }));
    }

    const results: FcmSendResult[] = [];

    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(token => this.sendToToken(token, message)),
      );
      results.push(...batchResults);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    this.logger.log(`Push enviado: ${successful} exitosos, ${failed} fallidos de ${tokens.length} total`);

    return results;
  }

 
  isTokenInvalid(errorCode: string): boolean {
    const invalidCodes = [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
      'messaging/invalid-argument',
    ];
    return invalidCodes.includes(errorCode);
  }
}
