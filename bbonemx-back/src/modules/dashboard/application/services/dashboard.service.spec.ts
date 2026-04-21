import { DashboardService } from './dashboard.service';
import { DashboardRepository } from '../../infrastructure/repositories';

const makeRepo = (): jest.Mocked<DashboardRepository> =>
  ({
    getActiveBacklog: jest.fn().mockResolvedValue(3),
    getTotalWorkOrders: jest.fn().mockResolvedValue(10),
    getDueToday: jest.fn().mockResolvedValue(1),
    getOverdue: jest.fn().mockResolvedValue(2),
    getCountByStatus: jest.fn().mockResolvedValue([]),
    getThroughputByWeek: jest.fn().mockResolvedValue([]),
    getMaintenanceMixByPeriod: jest.fn().mockResolvedValue([]),
    getDowntimeByAreaTop5: jest.fn().mockResolvedValue([]),
    getFindingsConversion: jest.fn().mockResolvedValue([]),
    getTopMachinesByDowntime: jest.fn().mockResolvedValue([]),
    getTopTechniciansByClosures: jest.fn().mockResolvedValue([]),
    getFindingsByArea: jest.fn().mockResolvedValue([]),
    getWorkOrdersByArea: jest.fn().mockResolvedValue([]),
    getActivitiesByResponsible: jest.fn().mockResolvedValue([]),
    getFindingsByCollection: jest.fn().mockResolvedValue([
      {
        collection: 'Ronda A',
        areas: [
          {
            areaId: 'a1',
            areaName: 'Producción',
            total: 5,
            pending: 2,
            done: 3,
          },
        ],
      },
      {
        collection: 'Sin colección',
        areas: [
          {
            areaId: 'a2',
            areaName: 'Mantenimiento',
            total: 1,
            pending: 0,
            done: 1,
          },
        ],
      },
    ]),
  }) as unknown as jest.Mocked<DashboardRepository>;

const input = {
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31',
};

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: jest.Mocked<DashboardRepository>;

  beforeEach(() => {
    repo = makeRepo();
    service = new DashboardService(repo);
  });

  it('incluye findingsByCollection en charts', async () => {
    const result = await service.getDashboardData(input as never);

    expect(repo.getFindingsByCollection).toHaveBeenCalledWith(input);
    expect(result.charts.findingsByCollection).toHaveLength(2);
    expect(result.charts.findingsByCollection[0].collection).toBe('Ronda A');
    expect(result.charts.findingsByCollection[0].areas[0].pending).toBe(2);
    expect(result.charts.findingsByCollection[0].areas[0].done).toBe(3);
  });

  it('retorna kpis correctos', async () => {
    const result = await service.getDashboardData(input as never);

    expect(result.kpis.activeBacklog).toBe(3);
    expect(result.kpis.totalWorkOrders).toBe(10);
    expect(result.kpis.dueToday).toBe(1);
    expect(result.kpis.overdue).toBe(2);
  });

  it('llama a todos los métodos del repositorio', async () => {
    await service.getDashboardData(input as never);

    expect(repo.getActiveBacklog).toHaveBeenCalledTimes(1);
    expect(repo.getFindingsByArea).toHaveBeenCalledTimes(1);
    expect(repo.getWorkOrdersByArea).toHaveBeenCalledTimes(1);
    expect(repo.getFindingsByCollection).toHaveBeenCalledTimes(1);
  });
});
