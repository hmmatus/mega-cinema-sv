import { RecoverPasswordUseCase } from './recover-password.use-case';

const mockSupabaseAuth = {
  updatePassword: vi.fn(),
};

describe('RecoverPasswordUseCase', () => {
  let useCase: RecoverPasswordUseCase;

  beforeEach(() => {
    useCase = new RecoverPasswordUseCase(mockSupabaseAuth as any);
    vi.clearAllMocks();
  });

  it('delegates to supabaseAuth.updatePassword', async () => {
    mockSupabaseAuth.updatePassword.mockResolvedValue(undefined);

    await expect(useCase.execute('uid-1', 'newpassword')).resolves.toBeUndefined();
    expect(mockSupabaseAuth.updatePassword).toHaveBeenCalledWith('uid-1', 'newpassword');
  });
});
