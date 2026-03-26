import { Injectable } from '@nestjs/common';
import { NotificationPreferencesRepository } from '../../infrastructure/repositories';
import { NotificationPreference } from '../../domain/entities';
import { NotificationType } from 'src/common';
import { UpdateNotificationPreferenceInput } from '../dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly preferencesRepository: NotificationPreferencesRepository,
  ) {}

  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    const saved = await this.preferencesRepository.findByUserId(userId);
    const savedTypes = new Set(saved.map((p) => p.notificationType));

    const allTypes = Object.values(NotificationType);
    const defaults: NotificationPreference[] = [];

    for (const type of allTypes) {
      if (!savedTypes.has(type)) {
        defaults.push(
          await this.preferencesRepository.getDefaults(userId, type),
        );
      }
    }

    return [...saved, ...defaults];
  }

  async getPreference(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationPreference> {
    return this.preferencesRepository.getDefaults(userId, type);
  }

  async getPreferencesForUsers(
    userIds: string[],
    type: NotificationType,
  ): Promise<Map<string, NotificationPreference>> {
    const preferences = await this.preferencesRepository.findByUserIdsAndType(
      userIds,
      type,
    );
    const preferencesByUserId = new Map(
      preferences.map((preference) => [preference.userId, preference]),
    );

    for (const userId of userIds) {
      if (!preferencesByUserId.has(userId)) {
        preferencesByUserId.set(
          userId,
          this.buildDefaultPreference(userId, type),
        );
      }
    }

    return preferencesByUserId;
  }

  async update(
    userId: string,
    input: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreference> {
    const data: Partial<NotificationPreference> = {};

    if (input.pushEnabled !== undefined) data.pushEnabled = input.pushEnabled;
    if (input.emailEnabled !== undefined)
      data.emailEnabled = input.emailEnabled;
    if (input.quietHoursStart !== undefined)
      data.quietHoursStart = input.quietHoursStart;
    if (input.quietHoursEnd !== undefined)
      data.quietHoursEnd = input.quietHoursEnd;

    data.inAppEnabled = true;

    return this.preferencesRepository.upsert(
      userId,
      input.notificationType,
      data,
    );
  }

  async bulkUpdate(
    userId: string,
    inputs: UpdateNotificationPreferenceInput[],
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = [];
    for (const input of inputs) {
      results.push(await this.update(userId, input));
    }
    return results;
  }

  private buildDefaultPreference(
    userId: string,
    type: NotificationType,
  ): NotificationPreference {
    const defaultPref = new NotificationPreference();
    defaultPref.userId = userId;
    defaultPref.notificationType = type;
    defaultPref.pushEnabled = true;
    defaultPref.emailEnabled = false;
    defaultPref.inAppEnabled = true;
    return defaultPref;
  }
}
