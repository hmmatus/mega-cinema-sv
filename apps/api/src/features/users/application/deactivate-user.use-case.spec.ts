import { DeactivateUserUseCase } from './deactivate-user.use-case';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockUserRepo = {
  findByIdWithRole: jest.fn(),
  deactivate: jest.fn(),
};

const makeUser = (id: string, roleName: string) => ({
  id,
  email: 'a@b.com',
  role: { name: roleName },
});

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;

  beforeEach(() => {
    useCase = new DeactivateUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('allows user to deactivate themselves', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-1', 'CLIENTE'));
    mockUserRepo.deactivate.mockResolvedValue({ id: 'uid-1', status: 'INACTIVE' });

    const result = await useCase.execute('uid-1', { requesterId: 'uid-1', requesterRole: 'CLIENTE' });
    expect(mockUserRepo.deactivate).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual({ id: 'uid-1', status: 'INACTIVE' });
  });

  it('allows ADMIN to deactivate a CLIENTE', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-2', 'CLIENTE'));
    mockUserRepo.deactivate.mockResolvedValue({ id: 'uid-2', status: 'INACTIVE' });

    await expect(
      useCase.execute('uid-2', { requesterId: 'admin-uid', requesterRole: 'ADMIN' }),
    ).resolves.toBeDefined();
  });

  it('throws 403 HttpProblemException when non-admin deactivates another user', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-2', 'CLIENTE'));

    const err = await useCase
      .execute('uid-2', { requesterId: 'uid-1', requesterRole: 'CLIENTE' })
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(403);
    expect(mockUserRepo.deactivate).not.toHaveBeenCalled();
  });

  it('throws 403 HttpProblemException when ADMIN deactivates another ADMIN', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-2', 'ADMIN'));

    const err = await useCase
      .execute('uid-2', { requesterId: 'admin-uid', requesterRole: 'ADMIN' })
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(403);
    expect((err as HttpProblemException).problem.type).toBe('/problems/forbidden');
    expect(mockUserRepo.deactivate).not.toHaveBeenCalled();
  });

  it('throws 404 HttpProblemException when target user not found', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(null);

    const err = await useCase
      .execute('missing', { requesterId: 'admin-uid', requesterRole: 'ADMIN' })
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpProblemException);
    expect((err as HttpProblemException).problem.status).toBe(404);
    expect((err as HttpProblemException).problem.type).toBe('/problems/user-not-found');
  });
});
