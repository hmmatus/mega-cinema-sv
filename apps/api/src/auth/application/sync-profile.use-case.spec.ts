import { SyncProfileUseCase } from './sync-profile.use-case';

const mockUserRepo = {
  upsertProfile: jest.fn(),
};

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' };

describe('SyncProfileUseCase', () => {
  let useCase: SyncProfileUseCase;

  beforeEach(() => {
    useCase = new SyncProfileUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('delegates to userRepo.upsertProfile', async () => {
    mockUserRepo.upsertProfile.mockResolvedValue(mockUser);

    const result = await useCase.execute({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    expect(mockUserRepo.upsertProfile).toHaveBeenCalledWith({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual(mockUser);
  });
});
