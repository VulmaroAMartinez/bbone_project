import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreventiveTasksCronService } from '../../services';
import { 
  SchedulerStatus, 
  CronJobStatus, 
} from '../types';
import { GenerateWorkOrdersResult } from 'src/modules/preventive-tasks';
import { JwtAuthGuard, RolesGuard, Roles, Role} from 'src/common';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SchedulerResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly preventiveTasksCron: PreventiveTasksCronService,
  ) {}

  // ==================== QUERIES ====================

  /**
   * Obtiene el estado general del scheduler.
   */
  @Query(() => SchedulerStatus, { name: 'schedulerStatus' })
  getSchedulerStatus(): SchedulerStatus {
    const globalEnabled = this.configService.get<boolean>('scheduler.enabled', true);
    
    const preventiveStatus = this.preventiveTasksCron.getStatus();

    const jobs: CronJobStatus[] = [
      {
        name: 'preventive-tasks-wo-generator',
        enabled: preventiveStatus.enabled,
        cronExpression: preventiveStatus.cronExpression,
        nextRunAt: preventiveStatus.nextRunAt || undefined,
      },
    ];

    return {
      globalEnabled,
      jobs,
    };
  }


  @Query(() => CronJobStatus, { name: 'preventiveTasksCronStatus' })
  getPreventiveTasksCronStatus(): CronJobStatus {
    const status = this.preventiveTasksCron.getStatus();
    return {
      name: 'preventive-tasks-wo-generator',
      enabled: status.enabled,
      cronExpression: status.cronExpression,
      nextRunAt: status.nextRunAt || undefined,
    };
  }

  
  @Mutation(() => GenerateWorkOrdersResult, { name: 'runPreventiveTasksCron' })
  async runPreventiveTasksCron(): Promise<GenerateWorkOrdersResult> {
    const result = await this.preventiveTasksCron.runManually();
    return {
      generated: result.generated,
      tasks: result.tasks,
    };
  }

  
  @Mutation(() => Boolean, { name: 'pausePreventiveTasksCron' })
  pausePreventiveTasksCron(): boolean {
    this.preventiveTasksCron.pause();
    return true;
  }

  @Mutation(() => Boolean, { name: 'resumePreventiveTasksCron' })
  resumePreventiveTasksCron(): boolean {
    this.preventiveTasksCron.resume();
    return true;
  }

}