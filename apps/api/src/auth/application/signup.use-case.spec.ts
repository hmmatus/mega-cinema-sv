import { ConflictException } from '@nestjs/common';
import { SignupUseCase } from './signup.use-case';

const mockUserRepo = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockSupabaseAuth = {
  createUser: jest.fn(),
};

describe('SignupUseCase', () => {
  let useCase: SignupUseCase;

  beforeEach(() => {
    useCase = new SignupUseCase(mockUserRepo as any, mockSupabaseAuth as any);
    jest.clearAllMocks();
  });

  it('creates auth user and DB record, returns user', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockSupabaseAuth.createUser.mockResolvedValue({ id: 'uid-1', email: 'a@b.com' });
    mockUserRepo.create.mockResolvedValue({ id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez' });

    const result = await useCase.execute({
      email: 'a@b.com',
      password: 'secret123',
      firstName: 'Ana',
      lastName: 'Lopez',
    });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('a@b.com');
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

  it('throws ConflictException when email already registered', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'uid-1' });

    await expect(
      useCase.execute({ email: 'a@b.com', password: 'secret123', firstName: 'Ana', lastName: 'Lopez' }),
    ).rejects.toThrow(ConflictException);

    expect(mockSupabaseAuth.createUser).not.toHaveBeenCalled();
  });
});
