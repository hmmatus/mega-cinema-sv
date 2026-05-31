import { SyncProfileUseCase } from './sync-profile.use-case';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' };

const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('SyncProfileUseCase', () => {
  let useCase: SyncProfileUseCase;

  beforeEach(() => {
    useCase = new SyncProfileUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('updates profile when user exists', async () => {
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({ ...mockUser, firstName: 'Ana' });

    const result = await useCase.execute({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    expect(mockUserRepo.findById).toHaveBeenCalledWith('uid-1');
    expect(mockUserRepo.update).toHaveBeenCalledWith('uid-1', {
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual({ ...mockUser, firstName: 'Ana' });
  });

  it('throws 404 when user does not exist in DB', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'uid-99', email: 'x@b.com', firstName: 'X', lastName: 'Y' }),
    ).rejects.toThrow(HttpProblemException);

    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});
