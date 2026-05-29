import { UpdateUserUseCase } from './update-user.use-case';
import { HttpProblemException } from '../../common/exceptions/http-problem.exception';

const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    useCase = new UpdateUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('updates and returns user when found', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'uid-1' });
    mockUserRepo.update.mockResolvedValue({ id: 'uid-1', firstName: 'Updated' });

    const result = await useCase.execute('uid-1', { firstName: 'Updated' });

    expect(mockUserRepo.update).toHaveBeenCalledWith('uid-1', { firstName: 'Updated' });
    expect(result).toEqual({ id: 'uid-1', firstName: 'Updated' });
  });

  it('throws 404 HttpProblemException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);
    const err = await useCase.execute('missing', { firstName: 'X' }).catch((e) => e);
    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(404);
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});
