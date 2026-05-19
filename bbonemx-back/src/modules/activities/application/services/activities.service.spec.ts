import { ForbiddenException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityInput } from '../dto/activity.dto';
import { User } from 'src/modules/users/domain/entities';
import { ActivityStatus } from 'src/common/enums';

describe('ActivitiesService', () => {
  const activitiesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const activityTechniciansRepository = {
    saveMany: jest.fn(),
    findByActivityId: jest.fn(),
  };
  const techniciansRepository = {
    findByUserId: jest.fn(),
  };
  const areasService = {
    findByIdOrFail: jest.fn(),
  };
  const machinesService = {
    findByIdOrFail: jest.fn(),
  };
  const excelGeneratorService = {
    generateExcelBuffer: jest.fn(),
  };

  const service = new ActivitiesService(
    activitiesRepository as never,
    activityTechniciansRepository as never,
    techniciansRepository as never,
    areasService as never,
    machinesService as never,
    excelGeneratorService as never,
  );

  const baseInput: CreateActivityInput = {
    areaId: 'area-1',
    activity: 'Inspección',
    startDate: '2026-05-19',
    technicianIds: ['tech-user-1'],
    status: ActivityStatus.PENDING,
  };

  const adminUser = {
    id: 'admin-1',
    isBoss: () => false,
    isAdmin: () => true,
  } as User;

  const bossUser = {
    id: 'boss-user-1',
    isBoss: () => true,
    isAdmin: () => false,
  } as User;

  const bossAdminUser = {
    id: 'boss-admin-1',
    isBoss: () => true,
    isAdmin: () => true,
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();
    areasService.findByIdOrFail.mockResolvedValue({ id: 'area-1' });
    activitiesRepository.create.mockResolvedValue({ id: 'act-1' });
    activitiesRepository.findById.mockResolvedValue({ id: 'act-1' });
    activityTechniciansRepository.saveMany.mockResolvedValue(undefined);
    techniciansRepository.findByUserId.mockResolvedValue({
      id: 'tech-1',
      userId: 'boss-user-1',
    });
  });

  describe('create', () => {
    it('permite crear actividad a ADMIN sin restricción de responsable', async () => {
      const input = { ...baseInput, technicianIds: ['other-user'] };

      await service.create(input, adminUser);

      expect(techniciansRepository.findByUserId).not.toHaveBeenCalled();
      expect(activitiesRepository.create).toHaveBeenCalled();
    });

    it('permite crear actividad a BOSS cuando se incluye como responsable', async () => {
      const input = {
        ...baseInput,
        technicianIds: ['boss-user-1', 'other-user'],
      };

      await service.create(input, bossUser);

      expect(techniciansRepository.findByUserId).toHaveBeenCalledWith(
        'boss-user-1',
      );
      expect(activityTechniciansRepository.saveMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            activityId: 'act-1',
            technicianId: 'boss-user-1',
            assignedBy: 'boss-user-1',
          }),
        ]),
      );
    });

    it('rechaza BOSS sin perfil de técnico', async () => {
      techniciansRepository.findByUserId.mockResolvedValue(null);

      await expect(service.create(baseInput, bossUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(activitiesRepository.create).not.toHaveBeenCalled();
    });

    it('rechaza BOSS que no se incluye en technicianIds', async () => {
      const input = { ...baseInput, technicianIds: ['other-user'] };

      await expect(service.create(input, bossUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(activitiesRepository.create).not.toHaveBeenCalled();
    });

    it('permite crear a usuario BOSS+ADMIN sin exigir auto-asignación', async () => {
      const input = { ...baseInput, technicianIds: ['other-user'] };

      await service.create(input, bossAdminUser);

      expect(techniciansRepository.findByUserId).not.toHaveBeenCalled();
      expect(activitiesRepository.create).toHaveBeenCalled();
    });

    it('deduplica technicianIds antes de persistir asignaciones', async () => {
      const input = {
        ...baseInput,
        technicianIds: ['boss-user-1', 'boss-user-1', 'other-user'],
      };

      await service.create(input, bossUser);

      type TechnicianAssignment = {
        activityId: string;
        technicianId: string;
        assignedBy: string;
        assignedAt: Date;
      };
      const saveManyMock = activityTechniciansRepository.saveMany as jest.Mock<
        Promise<void>,
        [TechnicianAssignment[]]
      >;
      const saved = saveManyMock.mock.calls[0]?.[0] ?? [];
      expect(saved).toHaveLength(2);
      expect(saved.map((a) => a.technicianId)).toEqual([
        'boss-user-1',
        'other-user',
      ]);
    });
  });
});
