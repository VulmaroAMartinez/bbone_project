import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkOrderSignaturesService } from './work-order-signatures.service';
import { WorkOrderStatus } from 'src/common';
import type { User } from 'src/modules/users/domain/entities';
import type { WorkOrder } from '../../domain/entities/work-order.entity';
import type { WorkOrderSignature } from '../../domain/entities/work-order-signature.entity';

function mockUser(partial: {
  id: string;
  isAdmin?: () => boolean;
  isTechnician?: () => boolean;
}): User {
  return {
    id: partial.id,
    isAdmin: partial.isAdmin ?? (() => false),
    isTechnician: partial.isTechnician ?? (() => false),
  } as User;
}

function mockWorkOrder(overrides: Partial<WorkOrder>): WorkOrder {
  return {
    id: 'wo-1',
    requesterId: 'req-1',
    status: WorkOrderStatus.FINISHED,
    pendingConformity: false,
    requester: mockUser({ id: 'req-1' }),
    ...overrides,
  } as WorkOrder;
}

describe('WorkOrderSignaturesService', () => {
  const signaturesState: WorkOrderSignature[] = [];
  let signerMeta = new Map<string, User>();

  const workOrderSignaturesRepository = {
    findByWorkOrderId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
    countByWorkOrderId: jest.fn(),
    hasUserSigned: jest.fn(),
    findByWorkOrderAndSigner: jest.fn(),
  };

  const workOrdersRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const woTechniciansRepository = {
    isTechnicianLead: jest.fn(),
    isTechnicianAssigned: jest.fn(),
    findByWorkOrderId: jest.fn(),
  };

  const service = new WorkOrderSignaturesService(
    workOrderSignaturesRepository as never,
    workOrdersRepository as never,
    woTechniciansRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    signaturesState.length = 0;
    signerMeta = new Map();

    workOrderSignaturesRepository.findByWorkOrderId.mockImplementation(
      async () => [...signaturesState],
    );
    workOrderSignaturesRepository.create.mockImplementation(
      async (data: Partial<WorkOrderSignature>) => {
        const signer =
          signerMeta.get(data.signerId!) ??
          mockUser({ id: data.signerId ?? 'unknown' });
        const sig = {
          id: `sig-${signaturesState.length + 1}`,
          workOrderId: data.workOrderId!,
          signerId: data.signerId!,
          signatureImagePath: data.signatureImagePath!,
          signer,
        } as WorkOrderSignature;
        signaturesState.push(sig);
        return sig;
      },
    );
    workOrderSignaturesRepository.hasUserSigned.mockImplementation(
      async (_woId: string, signerId: string) =>
        signaturesState.some((s) => s.signerId === signerId),
    );

    woTechniciansRepository.findByWorkOrderId.mockResolvedValue([
      {
        isLead: true,
        technicianId: 'tech-lead-1',
      },
    ]);
  });

  describe('findByIdOrFail', () => {
    it('lanza NotFoundException si no existe la firma', async () => {
      workOrderSignaturesRepository.findById.mockResolvedValue(null);

      await expect(service.findByIdOrFail('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('devuelve la firma cuando existe', async () => {
      const sig = { id: 's1' } as WorkOrderSignature;
      workOrderSignaturesRepository.findById.mockResolvedValue(sig);

      await expect(service.findByIdOrFail('s1')).resolves.toBe(sig);
    });
  });

  describe('delete', () => {
    it('hace soft delete de la firma', async () => {
      const sig = { id: 's1' } as WorkOrderSignature;
      workOrderSignaturesRepository.findById.mockResolvedValue(sig);

      await service.delete('s1');

      expect(workOrderSignaturesRepository.softDelete).toHaveBeenCalledWith(
        's1',
      );
    });
  });

  describe('sign', () => {
    const input = {
      workOrderId: 'wo-1',
      signatureImagePath: 'uploads/sig.png',
    };

    it('lanza NotFoundException si la OT no existe', async () => {
      workOrdersRepository.findById.mockResolvedValue(null);

      await expect(
        service.sign(input, mockUser({ id: 'req-1' })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza BadRequestException si el estado no permite firmar', async () => {
      workOrdersRepository.findById.mockResolvedValue(
        mockWorkOrder({ status: WorkOrderStatus.PENDING }),
      );

      await expect(
        service.sign(input, mockUser({ id: 'req-1' })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('lanza BadRequestException si pendingConformity', async () => {
      workOrdersRepository.findById.mockResolvedValue(
        mockWorkOrder({ pendingConformity: true }),
      );

      await expect(
        service.sign(input, mockUser({ id: 'req-1' })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('permite al solicitante firmar primero', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      workOrdersRepository.update.mockResolvedValue(null);

      const requester = mockUser({ id: 'req-1' });
      const result = await service.sign(input, requester);

      expect(result.signerId).toBe('req-1');
      expect(workOrdersRepository.update).not.toHaveBeenCalled();
    });

    it('lanza ForbiddenException si técnico auxiliar intenta firmar', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      woTechniciansRepository.isTechnicianLead.mockResolvedValue(false);
      woTechniciansRepository.isTechnicianAssigned.mockResolvedValue(true);

      await expect(
        service.sign(
          input,
          mockUser({ id: 'tech-aux', isTechnician: () => true }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lanza ForbiddenException si usuario sin rol válido intenta firmar', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      woTechniciansRepository.isTechnicianLead.mockResolvedValue(false);
      woTechniciansRepository.isTechnicianAssigned.mockResolvedValue(false);

      await expect(
        service.sign(input, mockUser({ id: 'stranger-1' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lanza ConflictException si el rol ya tiene firma', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      signaturesState.push({
        id: 'existing',
        signerId: 'req-1',
        workOrderId: 'wo-1',
        signatureImagePath: 'old.png',
        signer: mockUser({ id: 'req-1' }),
      } as WorkOrderSignature);

      await expect(
        service.sign(input, mockUser({ id: 'req-1' })),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('lanza ForbiddenException si admin firma cuando el solicitante es admin', async () => {
      const requesterAsAdmin = mockUser({ id: 'req-1', isAdmin: () => true });
      workOrdersRepository.findById.mockResolvedValue(
        mockWorkOrder({
          requester: { ...requesterAsAdmin, isAdmin: () => true } as User,
        }),
      );

      await expect(
        service.sign(input, mockUser({ id: 'other-admin', isAdmin: () => true })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lanza ForbiddenException si admin firma antes que el solicitante', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));

      await expect(
        service.sign(input, mockUser({ id: 'admin-1', isAdmin: () => true })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lanza ForbiddenException si admin firma antes que el técnico', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      signaturesState.push({
        id: 's-req',
        signerId: 'req-1',
        workOrderId: 'wo-1',
        signatureImagePath: 'r.png',
        signer: mockUser({ id: 'req-1' }),
      } as WorkOrderSignature);

      await expect(
        service.sign(input, mockUser({ id: 'admin-1', isAdmin: () => true })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lanza ForbiddenException si técnico firma antes que el solicitante (no admin)', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      woTechniciansRepository.isTechnicianLead.mockResolvedValue(true);

      await expect(
        service.sign(
          input,
          mockUser({ id: 'tech-lead-1', isTechnician: () => true }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('completa la OT al firmar el admin como tercera firma', async () => {
      workOrdersRepository.findById.mockImplementation(async (id: string) => {
        if (id !== 'wo-1') return null;
        return mockWorkOrder({});
      });
      signaturesState.push(
        {
          id: 's1',
          signerId: 'req-1',
          workOrderId: 'wo-1',
          signatureImagePath: 'a.png',
          signer: mockUser({ id: 'req-1' }),
        } as WorkOrderSignature,
        {
          id: 's2',
          signerId: 'tech-lead-1',
          workOrderId: 'wo-1',
          signatureImagePath: 'b.png',
          signer: mockUser({ id: 'tech-lead-1' }),
        } as WorkOrderSignature,
      );
      signerMeta.set('admin-1', mockUser({ id: 'admin-1', isAdmin: () => true }));

      woTechniciansRepository.isTechnicianLead.mockImplementation(
        async (_woId: string, userId: string) => userId === 'tech-lead-1',
      );

      await service.sign(
        input,
        mockUser({ id: 'admin-1', isAdmin: () => true }),
      );

      expect(workOrdersRepository.update).toHaveBeenCalledWith('wo-1', {
        status: WorkOrderStatus.COMPLETED,
      });
    });

    it('completa la OT con dos firmas cuando el solicitante es admin', async () => {
      const adminRequester = mockUser({ id: 'req-1', isAdmin: () => true });
      workOrdersRepository.findById.mockImplementation(async (id: string) => {
        if (id !== 'wo-1') return null;
        return mockWorkOrder({
          requester: adminRequester,
        });
      });
      signaturesState.push({
        id: 's1',
        signerId: 'req-1',
        workOrderId: 'wo-1',
        signatureImagePath: 'a.png',
        signer: adminRequester,
      } as WorkOrderSignature);

      woTechniciansRepository.isTechnicianLead.mockResolvedValue(true);

      await service.sign(
        input,
        mockUser({ id: 'tech-lead-1', isTechnician: () => true }),
      );

      expect(workOrdersRepository.update).toHaveBeenCalledWith('wo-1', {
        status: WorkOrderStatus.COMPLETED,
      });
    });
  });

  describe('isFullySigned', () => {
    it('devuelve false si la OT no existe', async () => {
      workOrdersRepository.findById.mockResolvedValue(null);

      await expect(service.isFullySigned('wo-x')).resolves.toBe(false);
    });

    it('devuelve true con solicitante, técnico y admin', async () => {
      workOrdersRepository.findById.mockResolvedValue(mockWorkOrder({}));
      woTechniciansRepository.findByWorkOrderId.mockResolvedValue([
        { isLead: true, technicianId: 'tech-lead-1' },
      ]);
      const adminSigner = mockUser({ id: 'admin-1', isAdmin: () => true });
      signaturesState.push(
        {
          id: 's1',
          signerId: 'req-1',
          signer: mockUser({ id: 'req-1' }),
        } as WorkOrderSignature,
        {
          id: 's2',
          signerId: 'tech-lead-1',
          signer: mockUser({ id: 'tech-lead-1' }),
        } as WorkOrderSignature,
        {
          id: 's3',
          signerId: 'admin-1',
          signer: adminSigner,
        } as WorkOrderSignature,
      );

      await expect(service.isFullySigned('wo-1')).resolves.toBe(true);
    });

    it('devuelve true con solicitante admin y técnico', async () => {
      const adminReq = mockUser({ id: 'req-1', isAdmin: () => true });
      workOrdersRepository.findById.mockResolvedValue(
        mockWorkOrder({ requester: adminReq }),
      );
      woTechniciansRepository.findByWorkOrderId.mockResolvedValue([
        { isLead: true, technicianId: 'tech-lead-1' },
      ]);
      signaturesState.push(
        {
          id: 's1',
          signerId: 'req-1',
          signer: adminReq,
        } as WorkOrderSignature,
        {
          id: 's2',
          signerId: 'tech-lead-1',
          signer: mockUser({ id: 'tech-lead-1' }),
        } as WorkOrderSignature,
      );

      await expect(service.isFullySigned('wo-1')).resolves.toBe(true);
    });
  });
});
