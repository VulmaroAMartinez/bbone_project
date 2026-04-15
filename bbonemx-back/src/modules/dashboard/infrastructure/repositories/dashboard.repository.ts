import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DashboardInput } from '../../application/dto';
import { WorkOrder } from 'src/modules/work-orders/domain/entities';
import { Finding } from 'src/modules/findings/domain/entities';
import { Activity } from 'src/modules/activities/domain/entities';
import { ActivityTechnician } from 'src/modules/activities/domain/entities/activity-technician.entity';
import { WorkOrderStatus, FindingStatus, MaintenanceType } from 'src/common';
import {
  AreaMetric,
  KeyValue,
  MachineMetric,
  MixPoint,
  ResponsibleActivityMetric,
  StatusCount,
  TechnicianMetric,
  TimeCount,
} from '../../presentation/types';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrdersRepo: Repository<WorkOrder>,
    @InjectRepository(Finding)
    private readonly findingsRepo: Repository<Finding>,
    @InjectRepository(Activity)
    private readonly activitiesRepo: Repository<Activity>,
    @InjectRepository(ActivityTechnician)
    private readonly activityTechniciansRepo: Repository<ActivityTechnician>,
  ) {}

  private isDateOnly(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private getDateBounds(input: DashboardInput): {
    dateFrom: string;
    dateToExclusive: string;
  } {
    const from = new Date(input.dateFrom);
    const to = new Date(input.dateTo);

    if (this.isDateOnly(input.dateFrom)) from.setUTCHours(0, 0, 0, 0);

    if (this.isDateOnly(input.dateTo)) {
      to.setUTCDate(to.getUTCDate() + 1);
      to.setUTCHours(0, 0, 0, 0);
    }

    return {
      dateFrom: from.toISOString(),
      dateToExclusive: to.toISOString(),
    };
  }

  private applyWorkOrderFilters(
    qb: SelectQueryBuilder<WorkOrder>,
    input: DashboardInput,
    applyDateOnCreatedAt = true,
    includeDateFilter = true,
  ): SelectQueryBuilder<WorkOrder> {
    qb.where('wo.is_active = true');

    if (applyDateOnCreatedAt && includeDateFilter) {
      const { dateFrom, dateToExclusive } = this.getDateBounds(input);
      qb.andWhere(
        'wo.created_at >= :dateFrom AND wo.created_at < :dateToExclusive',
        {
          dateFrom,
          dateToExclusive,
        },
      );
    }

    if (input.areaIds?.length)
      qb.andWhere('wo.area_id IN (:...areaIds)', { areaIds: input.areaIds });
    if (input.machineIds?.length)
      qb.andWhere('wo.machine_id IN (:...machineIds)', {
        machineIds: input.machineIds,
      });
    if (input.shiftIds?.length)
      qb.andWhere('wo.assigned_shift_id IN (:...shiftIds)', {
        shiftIds: input.shiftIds,
      });

    if (input.technicianIds?.length) {
      qb.innerJoin(
        'work_order_technicians',
        'wot_filter',
        'wot_filter.work_order_id = wo.id AND wot_filter.is_active = true',
      ).andWhere('wot_filter.technician_id IN (:...technicianIds)', {
        technicianIds: input.technicianIds,
      });
    }

    return qb;
  }

  async getActiveBacklog(input: DashboardInput): Promise<number> {
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true, false);

    qb.andWhere('wo.status IN (:...openStatuses)', {
      openStatuses: [
        WorkOrderStatus.PENDING,
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.PAUSED,
      ],
    });

    return qb.getCount();
  }

  async getCountByStatus(input: DashboardInput): Promise<StatusCount[]> {
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true);

    const rows = await qb
      .select('wo.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('wo.status')
      .getRawMany<{ status: string; count: string }>();

    return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  }

  async getTotalWorkOrders(input: DashboardInput): Promise<number> {
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true);
    return qb.getCount();
  }

  async getDueToday(input: DashboardInput): Promise<number> {
    const tz = input.timezone ?? 'America/Mexico_City';
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true, false);

    qb.andWhere('wo.maintenance_type = :maintenanceType', {
      maintenanceType: MaintenanceType.CORRECTIVE_SCHEDULED,
    })
      .andWhere('wo.status IN (:...openStatuses)', {
        openStatuses: [
          WorkOrderStatus.PENDING,
          WorkOrderStatus.IN_PROGRESS,
          WorkOrderStatus.PAUSED,
        ],
      })
      .andWhere('wo.scheduled_date IS NOT NULL')
      .andWhere(
        `(wo.scheduled_date AT TIME ZONE :tz)::date = (NOW() AT TIME ZONE :tz)::date`,
        { tz },
      );

    return qb.getCount();
  }

  async getOverdue(input: DashboardInput): Promise<number> {
    const tz = input.timezone ?? 'America/Mexico_City';
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true, false);

    qb.andWhere('wo.maintenance_type = :maintenanceType', {
      maintenanceType: MaintenanceType.CORRECTIVE_SCHEDULED,
    })
      .andWhere('wo.status IN (:...openStatuses)', {
        openStatuses: [
          WorkOrderStatus.PENDING,
          WorkOrderStatus.IN_PROGRESS,
          WorkOrderStatus.PAUSED,
        ],
      })
      .andWhere('wo.scheduled_date IS NOT NULL')
      .andWhere(
        `(wo.scheduled_date AT TIME ZONE :tz)::date < (NOW() AT TIME ZONE :tz)::date`,
        { tz },
      );

    return qb.getCount();
  }

  async getActivitiesByResponsible(
    input: DashboardInput,
  ): Promise<ResponsibleActivityMetric[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);

    const qb = this.activitiesRepo
      .createQueryBuilder('a')
      .innerJoin(
        'activity_technicians',
        'at',
        'at.activity_id = a.id AND at.is_active = true',
      )
      .innerJoin('users', 'u', 'u.id = at.technician_id')
      .where('a.is_active = true')
      .andWhere(
        'a.start_date >= :dateFrom AND a.start_date < :dateToExclusive',
        { dateFrom, dateToExclusive },
      );

    if (input.areaIds?.length)
      qb.andWhere('a.area_id IN (:...areaIds)', { areaIds: input.areaIds });

    const rows = await qb
      .select('u.id', 'responsibleId')
      .addSelect("concat(u.first_name, ' ', u.last_name)", 'responsibleName')
      .addSelect('COUNT(DISTINCT a.id)::int', 'totalActivities')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN a.end_date IS NOT NULL THEN a.id END)::int',
        'activitiesWithEndDate',
      )
      .groupBy('u.id')
      .addGroupBy('u.first_name')
      .addGroupBy('u.last_name')
      .orderBy('"totalActivities"', 'DESC')
      .limit(15)
      .getRawMany<{
        responsibleId: string;
        responsibleName: string;
        totalActivities: string;
        activitiesWithEndDate: string;
      }>();

    return rows.map((r) => ({
      responsibleId: r.responsibleId,
      responsibleName: r.responsibleName,
      totalActivities: Number(r.totalActivities),
      activitiesWithEndDate: Number(r.activitiesWithEndDate),
    }));
  }

  async getThroughputByWeek(input: DashboardInput): Promise<TimeCount[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, false);

    const rows = await qb
      .andWhere('wo.status IN (:...closedStatuses)', {
        closedStatuses: [
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.TEMPORARY_REPAIR,
        ],
      })
      .andWhere('wo.end_date >= :dateFrom AND wo.end_date < :dateToExclusive', {
        dateFrom,
        dateToExclusive,
      })
      .select(
        "to_char(date_trunc('week', wo.end_date), 'YYYY-MM-DD')",
        'period',
      )
      .addSelect('COUNT(*)::int', 'count')
      .groupBy("date_trunc('week', wo.end_date)")
      .orderBy("date_trunc('week', wo.end_date)", 'ASC')
      .getRawMany<{ period: string; count: string }>();

    return rows.map((r) => ({ period: r.period, count: Number(r.count) }));
  }

  async getMaintenanceMixByPeriod(input: DashboardInput): Promise<MixPoint[]> {
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true);

    const rows = await qb
      .select(
        "to_char(date_trunc('week', wo.created_at), 'YYYY-MM-DD')",
        'period',
      )
      .addSelect("COALESCE(wo.maintenance_type::text, 'UNSPECIFIED')", 'type')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy("date_trunc('week', wo.created_at)")
      .addGroupBy('wo.maintenance_type')
      .orderBy("date_trunc('week', wo.created_at)", 'ASC')
      .getRawMany<{ period: string; type: string; count: string }>();

    return rows.map((r) => ({
      period: r.period,
      type: r.type,
      count: Number(r.count),
    }));
  }

  async getDowntimeByAreaTop5(input: DashboardInput): Promise<AreaMetric[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, false);

    const rows = await qb
      .leftJoin('wo.area', 'area')
      .andWhere('wo.status IN (:...closedStatuses)', {
        closedStatuses: [
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.TEMPORARY_REPAIR,
        ],
      })
      .andWhere('wo.end_date >= :dateFrom AND wo.end_date < :dateToExclusive', {
        dateFrom,
        dateToExclusive,
      })
      .select('wo.area_id', 'areaId')
      .addSelect("COALESCE(area.name, 'Sin área')", 'areaName')
      .addSelect('COALESCE(SUM(wo.downtime_minutes),0)::int', 'value')
      .groupBy('wo.area_id')
      .addGroupBy('area.name')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany<{ areaId: string; areaName: string; value: string }>();

    return rows.map((r) => ({
      areaId: r.areaId,
      areaName: r.areaName,
      value: Number(r.value),
    }));
  }

  async getFindingsConversion(input: DashboardInput): Promise<KeyValue[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.findingsRepo
      .createQueryBuilder('f')
      .where('f.is_active = true');

    qb.andWhere(
      'f.created_at >= :dateFrom AND f.created_at < :dateToExclusive',
      {
        dateFrom,
        dateToExclusive,
      },
    );

    if (input.areaIds?.length)
      qb.andWhere('f.area_id IN (:...areaIds)', { areaIds: input.areaIds });
    if (input.machineIds?.length)
      qb.andWhere('f.machine_id IN (:...machineIds)', {
        machineIds: input.machineIds,
      });
    if (input.shiftIds?.length)
      qb.andWhere('f.shift_id IN (:...shiftIds)', { shiftIds: input.shiftIds });

    const [totalRaw, convertedRaw] = await Promise.all([
      qb.clone().select('COUNT(*)', 'total').getRawOne<{ total: string }>(),
      qb
        .clone()
        .andWhere('f.status = :status', {
          status: FindingStatus.CONVERTED_TO_WO,
        })
        .select('COUNT(*)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    const total = Number(totalRaw?.total || 0);
    const converted = Number(convertedRaw?.total || 0);
    const rate = total > 0 ? (converted / total) * 100 : 0;

    return [
      { key: 'convertedRate', value: rate },
      { key: 'totalFindings', value: total },
      { key: 'convertedFindings', value: converted },
    ];
  }

  async getTopMachinesByDowntime(
    input: DashboardInput,
  ): Promise<MachineMetric[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, false);

    const rows = await qb
      .leftJoin('wo.machine', 'machine')
      .andWhere('wo.status IN (:...closedStatuses)', {
        closedStatuses: [
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.TEMPORARY_REPAIR,
        ],
      })
      .andWhere('wo.end_date >= :dateFrom AND wo.end_date < :dateToExclusive', {
        dateFrom,
        dateToExclusive,
      })
      .select('wo.machine_id::text', 'machineId')
      .addSelect("COALESCE(machine.name, 'Sin máquina')", 'machineName')
      .addSelect('COALESCE(SUM(wo.downtime_minutes),0)::int', 'value')
      .groupBy('wo.machine_id')
      .addGroupBy('machine.name')
      .orderBy('value', 'DESC')
      .limit(10)
      .getRawMany<{
        machineId: string | null;
        machineName: string;
        value: string;
      }>();

    return rows.map((r) => ({
      machineId: r.machineId || undefined,
      machineName: r.machineName,
      value: Number(r.value),
    }));
  }

  async getFindingsByArea(input: DashboardInput): Promise<AreaMetric[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.findingsRepo
      .createQueryBuilder('f')
      .where('f.is_active = true');

    qb.andWhere(
      'f.created_at >= :dateFrom AND f.created_at < :dateToExclusive',
      { dateFrom, dateToExclusive },
    );

    if (input.areaIds?.length)
      qb.andWhere('f.area_id IN (:...areaIds)', { areaIds: input.areaIds });
    if (input.shiftIds?.length)
      qb.andWhere('f.shift_id IN (:...shiftIds)', { shiftIds: input.shiftIds });

    const rows = await qb
      .leftJoin('f.area', 'area')
      .select('f.area_id', 'areaId')
      .addSelect("COALESCE(area.name, 'Sin área')", 'areaName')
      .addSelect('COUNT(*)::int', 'value')
      .groupBy('f.area_id')
      .addGroupBy('area.name')
      .orderBy('value', 'DESC')
      .getRawMany<{ areaId: string; areaName: string; value: string }>();

    return rows.map((r) => ({
      areaId: r.areaId,
      areaName: r.areaName,
      value: Number(r.value),
    }));
  }

  async getWorkOrdersByArea(input: DashboardInput): Promise<AreaMetric[]> {
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, true);

    if (input.woStatuses?.length) {
      qb.andWhere('wo.status IN (:...woStatuses)', {
        woStatuses: input.woStatuses,
      });
    }

    const rows = await qb
      .leftJoin('wo.area', 'area')
      .select('wo.area_id', 'areaId')
      .addSelect("COALESCE(area.name, 'Sin área')", 'areaName')
      .addSelect('COUNT(*)::int', 'value')
      .groupBy('wo.area_id')
      .addGroupBy('area.name')
      .orderBy('value', 'DESC')
      .getRawMany<{ areaId: string; areaName: string; value: string }>();

    return rows.map((r) => ({
      areaId: r.areaId,
      areaName: r.areaName,
      value: Number(r.value),
    }));
  }

  async getTopTechniciansByClosures(
    input: DashboardInput,
  ): Promise<TechnicianMetric[]> {
    const { dateFrom, dateToExclusive } = this.getDateBounds(input);
    const qb = this.workOrdersRepo.createQueryBuilder('wo');
    this.applyWorkOrderFilters(qb, input, false);

    const rows = await qb
      .innerJoin(
        'work_order_technicians',
        'wot',
        'wot.work_order_id = wo.id AND wot.is_active = true',
      )
      .innerJoin('users', 'u', 'u.id = wot.technician_id')
      .andWhere('wo.status IN (:...closedStatuses)', {
        closedStatuses: [
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.TEMPORARY_REPAIR,
        ],
      })
      .andWhere('wo.end_date >= :dateFrom AND wo.end_date < :dateToExclusive', {
        dateFrom,
        dateToExclusive,
      })
      .select('u.id', 'technicianId')
      .addSelect("concat(u.first_name, ' ', u.last_name)", 'technicianName')
      .addSelect('COUNT(DISTINCT wo.id)::int', 'value')
      .groupBy('u.id')
      .addGroupBy('u.first_name')
      .addGroupBy('u.last_name')
      .orderBy('value', 'DESC')
      .limit(10)
      .getRawMany<{
        technicianId: string;
        technicianName: string;
        value: string;
      }>();

    return rows.map((r) => ({
      technicianId: r.technicianId,
      technicianName: r.technicianName,
      value: Number(r.value),
    }));
  }
}
