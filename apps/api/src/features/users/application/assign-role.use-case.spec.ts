import { AssignRoleUseCase } from './assign-role.use-case';

const mockSupabaseAuth = {
  updateUserRole: vi.fn(),
};

describe('AssignRoleUseCase', () => {
  let useCase: AssignRoleUseCase;

  beforeEach(() => {
    useCase = new AssignRoleUseCase(mockSupabaseAuth as any);
    vi.clearAllMocks();
  });

  it('calls updateUserRole with correct targetId and role', async () => {
    mockSupabaseAuth.updateUserRole.mockResolvedValue(undefined);

    await useCase.execute('uid-target', 'employee');

    expect(mockSupabaseAuth.updateUserRole).toHaveBeenCalledWith('uid-target', 'employee');
    expect(mockSupabaseAuth.updateUserRole).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from the port', async () => {
    mockSupabaseAuth.updateUserRole.mockRejectedValue(new Error('Supabase error'));

    await expect(useCase.execute('uid-1', 'admin')).rejects.toThrow('Supabase error');
  });
});
