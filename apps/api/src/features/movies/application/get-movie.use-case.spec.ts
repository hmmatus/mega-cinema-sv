import { Test, TestingModule } from '@nestjs/testing';
import { GetMovieUseCase } from './get-movie.use-case';
import { MOVIE_REPOSITORY } from '../domain/ports/movie.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockRepo = {
  findByIdWithShowtimes: vi.fn(),
  findById: vi.fn(),
};

describe('GetMovieUseCase', () => {
  let useCase: GetMovieUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMovieUseCase,
        { provide: MOVIE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetMovieUseCase>(GetMovieUseCase);
    vi.clearAllMocks();
  });

  it('returns movie with showtimes for public user when visibility=PUBLIC', async () => {
    const movie = { id: '1', visibility: 'PUBLIC', upcomingShowtimes: [] };
    mockRepo.findByIdWithShowtimes.mockResolvedValue(movie);
    const result = await useCase.execute('1', false);
    expect(result).toEqual(movie);
  });

  it('throws 404 for public user when visibility=HIDDEN', async () => {
    mockRepo.findByIdWithShowtimes.mockResolvedValue({ id: '1', visibility: 'HIDDEN', upcomingShowtimes: [] });
    await expect(useCase.execute('1', false)).rejects.toThrow(HttpProblemException);
  });

  it('returns HIDDEN movie for admin', async () => {
    const movie = { id: '1', visibility: 'HIDDEN', upcomingShowtimes: [] };
    mockRepo.findByIdWithShowtimes.mockResolvedValue(movie);
    const result = await useCase.execute('1', true);
    expect(result).toEqual(movie);
  });

  it('throws 404 when movie not found', async () => {
    mockRepo.findByIdWithShowtimes.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', false)).rejects.toThrow(HttpProblemException);
  });
});
