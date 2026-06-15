import { Test, TestingModule } from '@nestjs/testing';
import { GetBannerUseCase } from './get-banner.use-case';
import { BANNER_REPOSITORY } from '../domain/ports/banner.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockRepo = { findById: vi.fn() };

describe('GetBannerUseCase', () => {
  let useCase: GetBannerUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetBannerUseCase, { provide: BANNER_REPOSITORY, useValue: mockRepo }],
    }).compile();

    useCase = module.get<GetBannerUseCase>(GetBannerUseCase);
    vi.clearAllMocks();
  });

  it('returns ACTIVE banner for public user', async () => {
    const banner = { id: '1', status: 'ACTIVE' };
    mockRepo.findById.mockResolvedValue(banner);
    const result = await useCase.execute('1', false);
    expect(result).toEqual(banner);
  });

  it('throws 404 for public user when status=DRAFT', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1', status: 'DRAFT' });
    await expect(useCase.execute('1', false)).rejects.toThrow(HttpProblemException);
  });

  it('throws 404 for public user when status=INACTIVE', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1', status: 'INACTIVE' });
    await expect(useCase.execute('1', false)).rejects.toThrow(HttpProblemException);
  });

  it('returns DRAFT banner for admin', async () => {
    const banner = { id: '1', status: 'DRAFT' };
    mockRepo.findById.mockResolvedValue(banner);
    const result = await useCase.execute('1', true);
    expect(result).toEqual(banner);
  });

  it('throws 404 when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', false)).rejects.toThrow(HttpProblemException);
  });
});
