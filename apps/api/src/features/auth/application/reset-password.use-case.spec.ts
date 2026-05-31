import { ResetPasswordUseCase } from './reset-password.use-case';

const mockSupabaseAuth = {
  sendPasswordResetEmail: jest.fn(),
};

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    useCase = new ResetPasswordUseCase(mockSupabaseAuth as any);
    jest.clearAllMocks();
  });

  it('delegates to supabaseAuth.sendPasswordResetEmail', async () => {
    mockSupabaseAuth.sendPasswordResetEmail.mockResolvedValue(undefined);

    await expect(useCase.execute('a@b.com')).resolves.toBeUndefined();
    expect(mockSupabaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.com');
  });
});
