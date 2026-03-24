import { registerAs } from '@nestjs/config';

export default registerAs('scheduler', () => ({
  // Si no se define la variable, asumimos scheduler habilitado.
  enabled: process.env.SCHEDULER_ENABLED !== 'false',
  jobs: {
    preventiveTasks: {
      enabled: process.env.CRON_PREVENTIVE_TASKS_ENABLED === 'true',
      cron: process.env.CRON_PREVENTIVE_TASKS || '0 * * * *',
    },
    cleanup: {
      enabled: process.env.CRON_CLEANUP_ENABLED === 'true',
      cron: process.env.CRON_CLEANUP || '0 3 * * *',
      retentionDays: parseInt(process.env.CRON_CLEANUP_RETENTION_DAYS || '90'),
    },

    reminders: {
      enabled: process.env.CRON_REMINDERS_ENABLED === 'true',
      cron: process.env.CRON_REMINDERS || '0 8 * * *',
    },
    technicianBirthdays: {
      enabled: process.env.CRON_TECHNICIAN_BIRTHDAYS_ENABLED === 'true',
      cron: process.env.CRON_TECHNICIAN_BIRTHDAYS || '0 8 * * 1',
      timeZone:
        process.env.CRON_TECHNICIAN_BIRTHDAYS_TZ || 'America/Mexico_City',
    },
  },
}));
