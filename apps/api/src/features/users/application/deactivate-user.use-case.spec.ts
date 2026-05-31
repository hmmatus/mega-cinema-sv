import { DeactivateUserUseCase } from './deactivate-user.use-case';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockUserRepo = {
  findById: jest.fn(),
  deactivate: jest.fn(),
};

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;

  beforeEach(() => {
    useCase = new DeactivateUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('deactivates existing user', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'uid-1', email: 'a@b.com' });
    mockUserRepo.deactivate.mockResolvedValue({ id: 'uid-1', status: 'INACTIVE' });

    const result = await useCase.execute('uid-1');

    expect(mockUserRepo.findById).toHaveBeenCalledWith('uid-1');
    expect(mockUserRepo.deactivate).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual({ id: 'uid-1', status: 'INACTIVE' });
  });

  it('throws 404 when target user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    const err = await useCase.execute('missing').catch((e) => e);

    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(404);
    expect((err as HttpProblemException).problem.type).toBe('/problems/user-not-found');
    expect(mockUserRepo.deactivate).not.toHaveBeenCalled();
  });
});
