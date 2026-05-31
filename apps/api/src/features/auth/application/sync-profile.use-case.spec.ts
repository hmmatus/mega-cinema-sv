import { SyncProfileUseCase } from './sync-profile.use-case';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' };

const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockSupabaseAuth = {
  updateUserRole: jest.fn(),
};

describe('SyncProfileUseCase', () => {
  let useCase: SyncProfileUseCase;

  beforeEach(() => {
    useCase = new SyncProfileUseCase(mockUserRepo as any, mockSupabaseAuth as any);
    jest.clearAllMocks();
  });

  it('updates profile and sets role=user when currentRole is user', async () => {
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({ ...mockUser, firstName: 'Ana' });
    mockSupabaseAuth.updateUserRole.mockResolvedValue(undefined);

    const result = await useCase.execute({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      currentRole: 'user',
    });

    expect(mockUserRepo.findById).toHaveBeenCalledWith('uid-1');
    expect(mockUserRepo.update).toHaveBeenCalledWith('uid-1', {
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(mockSupabaseAuth.updateUserRole).toHaveBeenCalledWith('uid-1', 'user');
    expect(result).toEqual({ ...mockUser, firstName: 'Ana' });
  });

  it('does not overwrite role when currentRole is admin', async () => {
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue(mockUser);

    await useCase.execute({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      currentRole: 'admin',
    });

    expect(mockSupabaseAuth.updateUserRole).not.toHaveBeenCalled();
  });

  it('does not overwrite role when currentRole is employee', async () => {
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue(mockUser);

    await useCase.execute({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      currentRole: 'employee',
    });

    expect(mockSupabaseAuth.updateUserRole).not.toHaveBeenCalled();
  });

  it('throws 404 when user does not exist in DB', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'uid-99', email: 'x@b.com', firstName: 'X', lastName: 'Y', currentRole: 'user' }),
    ).rejects.toThrow(HttpProblemException);

    expect(mockUserRepo.update).not.toHaveBeenCalled();
    expect(mockSupabaseAuth.updateUserRole).not.toHaveBeenCalled();
  });
});
