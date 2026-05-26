import { SyncProfileUseCase } from './sync-profile.use-case';

const mockUserRepo = {
  findById: jest.fn(),
  create: jest.fn(),
};

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' };

describe('SyncProfileUseCase', () => {
  let useCase: SyncProfileUseCase;

  beforeEach(() => {
    useCase = new SyncProfileUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('returns existing user without creating', async () => {
    mockUserRepo.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    expect(mockUserRepo.findById).toHaveBeenCalledWith('uid-1');
    expect(mockUserRepo.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('creates user on first Google login', async () => {
    mockUserRepo.findById.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue(mockUser);

    const result = await useCase.execute({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    expect(mockUserRepo.create).toHaveBeenCalledWith({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual(mockUser);
  });
});
