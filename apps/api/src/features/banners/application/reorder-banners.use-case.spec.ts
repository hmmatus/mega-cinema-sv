import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReorderBannersUseCase } from './reorder-banners.use-case';
import { BANNER_REPOSITORY } from '../domain/ports/banner.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';

const mockRepo = { reorder: vi.fn() };
const mockAudit = { log: vi.fn().mockResolvedValue(undefined) };
const mockTx = {};
const mockPrisma = { $transaction: vi.fn((fn: any) => fn(mockTx)) };

describe('ReorderBannersUseCase', () => {
  let useCase: ReorderBannersUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReorderBannersUseCase,
        { provide: BANNER_REPOSITORY, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    useCase = module.get<ReorderBannersUseCase>(ReorderBannersUseCase);
    vi.clearAllMocks();
  });

  it('throws BadRequestException for duplicate IDs', async () => {
    const dto = { banners: [{ id: 'a', position: 0 }, { id: 'a', position: 1 }] };
    await expect(useCase.execute(dto, 'u', 'r')).rejects.toThrow(BadRequestException);
  });

  it('calls repo.reorder and audit.log on success', async () => {
    const banners = [{ id: '1', status: 'ACTIVE' }, { id: '2', status: 'ACTIVE' }];
    mockRepo.reorder.mockResolvedValue(banners);
    const dto = { banners: [{ id: '1', position: 0 }, { id: '2', position: 1 }] };

    const result = await useCase.execute(dto, 'user-1', 'role-1', '127.0.0.1');

    expect(mockRepo.reorder).toHaveBeenCalledWith(dto.banners);
    expect(mockAudit.log).toHaveBeenCalledWith(
      mockTx,
      expect.objectContaining({ action: 'REORDER', entityName: 'banners' }),
    );
    expect(result).toEqual(banners);
  });
});
