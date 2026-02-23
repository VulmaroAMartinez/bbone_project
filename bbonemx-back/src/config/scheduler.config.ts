import { registerAs } from "@nestjs/config";

export default registerAs('scheduler', () => ({
    enabled: process.env.SCHEDULER_ENABLED === 'false',
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
    }
}))