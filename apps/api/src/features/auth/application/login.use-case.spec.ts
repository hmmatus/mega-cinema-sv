import { LoginUseCase } from './login.use-case';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

const mockSupabaseAuth = {
  signInWithPassword: vi.fn(),
};

const mockUserRepo = {
  findById: vi.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    useCase = new LoginUseCase(mockSupabaseAuth as any, mockUserRepo as any);
    vi.clearAllMocks();
  });

  it('returns accessToken and userId for active user', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ accessToken: 'tok', userId: 'uid-1' });
    mockUserRepo.findById.mockResolvedValue({ id: 'uid-1', status: 'ACTIVE' });

    const result = await useCase.execute({ email: 'a@b.com', password: 'secret123' });

    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(result).toEqual({ accessToken: 'tok', userId: 'uid-1' });
  });

  it('throws HttpProblemException 401 for INACTIVE user', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ accessToken: 'tok', userId: 'uid-1' });
    mockUserRepo.findById.mockResolvedValue({ id: 'uid-1', status: 'INACTIVE' });

    await expect(useCase.execute({ email: 'a@b.com', password: 'secret123' })).rejects.toThrow(
      HttpProblemException,
    );

    const rejection = useCase
      .execute({ email: 'a@b.com', password: 'secret123' })
      .catch((e: HttpProblemException) => e);
    const err = await rejection;
    expect((err as HttpProblemException).problem.status).toBe(401);
    expect((err as HttpProblemException).problem.type).toBe('/problems/account-inactive');
  });

  it('propagates error from adapter on invalid credentials', async () => {
    mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Invalid credentials'));

    await expect(useCase.execute({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
