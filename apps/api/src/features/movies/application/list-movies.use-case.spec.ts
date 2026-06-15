import { Test, TestingModule } from '@nestjs/testing';
import { ListMoviesUseCase } from './list-movies.use-case';
import { MOVIE_REPOSITORY } from '../domain/ports/movie.repository';

const mockRepo = {
  findMany: vi.fn(),
  findFeatured: vi.fn(),
  findByStatus: vi.fn(),
};

describe('ListMoviesUseCase', () => {
  let useCase: ListMoviesUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMoviesUseCase,
        { provide: MOVIE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ListMoviesUseCase>(ListMoviesUseCase);
    vi.clearAllMocks();
  });

  it('forces visibility=PUBLIC for non-admin', async () => {
    mockRepo.findMany.mockResolvedValue({ data: [], pagination: {} });
    await useCase.execute({}, false);
    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: 'PUBLIC' }),
      expect.any(Object),
    );
  });

  it('does not force visibility for admin', async () => {
    mockRepo.findMany.mockResolvedValue({ data: [], pagination: {} });
    await useCase.execute({}, true);
    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: undefined }),
      expect.any(Object),
    );
  });

  it('passes status filter through', async () => {
    mockRepo.findMany.mockResolvedValue({ data: [], pagination: {} });
    await useCase.execute({ status: 'RELEASED' } as any, false);
    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'RELEASED' }),
      expect.any(Object),
    );
  });
});
