import { FindUserUseCase } from './find-user.use-case';
import { HttpProblemException } from '../../common/exceptions/http-problem.exception';

const mockUserRepo = {
  findByIdWithRole: jest.fn(),
};

const mockUserWithRole = {
  id: 'uid-1',
  email: 'a@b.com',
  firstName: 'Ana',
  lastName: 'Lopez',
  role: { name: 'CLIENTE' },
};

describe('FindUserUseCase', () => {
  let useCase: FindUserUseCase;

  beforeEach(() => {
    useCase = new FindUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('returns user with role when found', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(mockUserWithRole);
    const result = await useCase.execute('uid-1');
    expect(mockUserRepo.findByIdWithRole).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual(mockUserWithRole);
  });

  it('throws 404 HttpProblemException when user not found', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(null);
    const err = await useCase.execute('missing').catch((e) => e);
    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(404);
    expect(mockUserRepo.findByIdWithRole).toHaveBeenCalledWith('missing');
  });
});
