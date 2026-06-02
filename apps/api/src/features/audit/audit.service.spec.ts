import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  it('writes audit log with correct payload', async () => {
    const payload = {
      userId: 'user-1',
      roleId: 'role-1',
      entityName: 'movies',
      entityId: 'movie-1',
      action: 'CREATE',
      newValue: { title: 'Test' },
      sourceIp: '127.0.0.1',
    };

    await service.log(mockPrismaService as unknown as PrismaService, payload);

    expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        roleId: 'role-1',
        entityName: 'movies',
        entityId: 'movie-1',
        action: 'CREATE',
        sourceIp: '127.0.0.1',
      }),
    });
  });

  it('resolves to undefined', async () => {
    const result = await service.log(mockPrismaService as unknown as PrismaService, {
      userId: 'u', roleId: 'r', entityName: 'e', entityId: 'id', action: 'A',
    });
    expect(result).toBeUndefined();
  });
});
