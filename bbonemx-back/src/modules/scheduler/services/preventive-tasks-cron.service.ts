import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { PreventiveTasksService } from "../../preventive-tasks";

@Injectable()
export class PreventiveTasksCronService implements OnModuleInit {

    private readonly logger = new Logger(PreventiveTasksCronService.name);
    private readonly jobName = 'preventive-tasks-wo-generator';
    private isEnabled: boolean;
    private cronExpression: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly preventiveTasksService: PreventiveTasksService,
    ) {
        this.isEnabled = this.configService.get<boolean>('scheduler.jobs.preventiveTasks.enabled', true);
        this.cronExpression = this.configService.get<string>('scheduler.jobs.preventiveTasks.cron', '0 * * * *')
    }

    onModuleInit() {
        if (!this.isEnabled) return;

        try {
            const job = new CronJob(this.cronExpression, async () => {
                this.handleCron();
            });

            this.schedulerRegistry.addCronJob(this.jobName, job);
            job.start();
            this.logger.log(`Preventive tasks cron job started with cron expression ${this.cronExpression}`);

        } catch (error) {
            this.logger.error(`Error starting preventive tasks cron job: ${error.message}`);
        }
    }

    async handleCron() {
        this.logger.log('Starting preventive tasks WO generation...');
        const startTime = Date.now();

        try {
            const result = await this.preventiveTasksService.generateDueWorkOrders();

            const duration = Date.now() - startTime;
            this.logger.log(
                `Preventive tasks cron completed: ${result.generated} WOs generated in ${duration}ms`
            );

            if (result.generated > 0) {
                this.logger.log(`Task IDs processed: ${result.tasks.join(', ')}`);
            }
        } catch (error) {
            this.logger.error(`Preventive tasks cron failed: ${error.message}`, error.stack);
        }
    }

    async runManually() {
        this.logger.log('Running preventive tasks WO generation manually...');
        const startTime = Date.now();
        try {
            const result = await this.preventiveTasksService.generateDueWorkOrders();
            const duration = Date.now() - startTime;
            this.logger.log(`Preventive tasks WO generation completed: ${result.generated} WOs generated in ${duration}ms`);
            return result;
        } catch (error) {
            this.logger.error(`Preventive tasks WO generation failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    getStatus(): { enabled: boolean; cronExpression: string; nextRunAt: Date | null; } {
        let nextRun: Date | null = null;

        try {
            const job = this.schedulerRegistry.getCronJob(this.jobName);
            if (job) {
                nextRun = job.nextDate().toJSDate();
            }
        } catch {
            // Job no registrado
        }

        return {
            enabled: this.isEnabled,
            cronExpression: this.cronExpression,
            nextRunAt: nextRun,
        };
    }

    pause(): void {
        try {
            const job = this.schedulerRegistry.getCronJob(this.jobName);
            job.stop();
            this.logger.log('Preventive tasks cron job paused');
        } catch (error) {
            this.logger.error(`Failed to pause cron job: ${error.message}`);
        }
    }

    resume(): void {
        try {
            const job = this.schedulerRegistry.getCronJob(this.jobName);
            job.start();
            this.logger.log('Preventive tasks cron job resumed');
        } catch (error) {
            this.logger.error(`Failed to resume cron job: ${error.message}`);
        }
    }
}
