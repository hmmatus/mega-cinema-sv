import { LoginUseCase } from './login.use-case';

const mockSupabaseAuth = {
  signInWithPassword: jest.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    useCase = new LoginUseCase(mockSupabaseAuth as any);
    jest.clearAllMocks();
  });

  it('returns accessToken and userId on valid credentials', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ accessToken: 'tok', userId: 'uid-1' });

    const result = await useCase.execute({ email: 'a@b.com', password: 'secret123' });

    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(result).toEqual({ accessToken: 'tok', userId: 'uid-1' });
  });

  it('propagates UnauthorizedException from adapter', async () => {
    const { UnauthorizedException } = await import('@nestjs/common');
    mockSupabaseAuth.signInWithPassword.mockRejectedValue(new UnauthorizedException());

    await expect(useCase.execute({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
