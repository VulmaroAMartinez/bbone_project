jest.mock('src/modules/work-orders/application/services/work-orders.service', () => ({
  WorkOrdersService: class WorkOrdersService {},
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivityWorkOrdersService } from './activity-work-orders.service';

describe('ActivityWorkOrdersService', () => {
  const repository = {
    findByActivityAndWorkOrder: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };
  const activitiesService = {
    findByIdOrFail: jest.fn(),
  };
  const workOrdersService = {
    findByFolio: jest.fn(),
  };

  const service = new ActivityWorkOrdersService(
    repository as any,
    activitiesService as any,
    workOrdersService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    activitiesService.findByIdOrFail.mockResolvedValue({ id: 'act-1' });
  });

  it('vincula OT por folio cuando existe', async () => {
    workOrdersService.findByFolio.mockResolvedValue({ id: 'wo-1' });
    repository.findByActivityAndWorkOrder.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 'awo-1' });

    const result = await service.addByFolio('act-1', 'OT-001');

    expect(result).toEqual({ id: 'awo-1' });
    expect(repository.create).toHaveBeenCalledWith({
      activityId: 'act-1',
      workOrderId: 'wo-1',
    });
  });

  it('falla si la OT no existe', async () => {
    workOrdersService.findByFolio.mockResolvedValue(null);

    await expect(service.addByFolio('act-1', 'OT-X')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('falla si la OT ya estaba vinculada', async () => {
    workOrdersService.findByFolio.mockResolvedValue({ id: 'wo-1' });
    repository.findByActivityAndWorkOrder.mockResolvedValue({ id: 'awo-existing' });

    await expect(service.addByFolio('act-1', 'OT-001')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
