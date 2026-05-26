import { ConflictException } from '@nestjs/common';
import { SignupUseCase } from './signup.use-case';

const mockUserRepo = {
  create: jest.fn(),
};

const mockSupabaseAuth = {
  createUser: jest.fn(),
  deleteUser: jest.fn(),
};

describe('SignupUseCase', () => {
  let useCase: SignupUseCase;

  beforeEach(() => {
    useCase = new SignupUseCase(mockUserRepo as any, mockSupabaseAuth as any);
    jest.clearAllMocks();
  });

  it('creates auth user and DB record, returns user', async () => {
    mockSupabaseAuth.createUser.mockResolvedValue({ id: 'uid-1', email: 'a@b.com' });
    mockUserRepo.create.mockResolvedValue({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    const result = await useCase.execute({
      email: 'a@b.com',
      password: 'secret123',
      firstName: 'Ana',
      lastName: 'Lopez',
    });

    expect(mockSupabaseAuth.createUser).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(mockUserRepo.create).toHaveBeenCalledWith({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });
  });

  it('throws ConflictException and compensates when DB unique violation (P2002)', async () => {
    mockSupabaseAuth.createUser.mockResolvedValue({ id: 'uid-1', email: 'a@b.com' });
    mockUserRepo.create.mockRejectedValue({ code: 'P2002' });
    mockSupabaseAuth.deleteUser.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: 'a@b.com', password: 'secret123', firstName: 'Ana', lastName: 'Lopez' }),
    ).rejects.toThrow(ConflictException);

    expect(mockSupabaseAuth.deleteUser).toHaveBeenCalledWith('uid-1');
  });

  it('compensates and rethrows on non-conflict DB error', async () => {
    const dbError = new Error('DB connection lost');
    mockSupabaseAuth.createUser.mockResolvedValue({ id: 'uid-1', email: 'a@b.com' });
    mockUserRepo.create.mockRejectedValue(dbError);
    mockSupabaseAuth.deleteUser.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ email: 'a@b.com', password: 'secret123', firstName: 'Ana', lastName: 'Lopez' }),
    ).rejects.toThrow('DB connection lost');

    expect(mockSupabaseAuth.deleteUser).toHaveBeenCalledWith('uid-1');
  });
});
