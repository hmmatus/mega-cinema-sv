import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeactivateUserUseCase } from './deactivate-user.use-case';

const mockUserRepo = {
  findByIdWithRole: jest.fn(),
  deactivate: jest.fn(),
};

const makeUser = (id: string, roleName: string) => ({
  id,
  email: 'a@b.com',
  role: { name: roleName },
});

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;

  beforeEach(() => {
    useCase = new DeactivateUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('allows user to deactivate themselves', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-1', 'CLIENTE'));
    mockUserRepo.deactivate.mockResolvedValue({ id: 'uid-1', status: 'INACTIVE' });

    const result = await useCase.execute('uid-1', { requesterId: 'uid-1', requesterRole: 'CLIENTE' });
    expect(mockUserRepo.deactivate).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual({ id: 'uid-1', status: 'INACTIVE' });
  });

  it('allows ADMIN to deactivate any user', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-2', 'CLIENTE'));
    mockUserRepo.deactivate.mockResolvedValue({ id: 'uid-2', status: 'INACTIVE' });

    await expect(
      useCase.execute('uid-2', { requesterId: 'admin-uid', requesterRole: 'ADMIN' }),
    ).resolves.toBeDefined();
  });

  it('throws ForbiddenException when non-admin deactivates another user', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(makeUser('uid-2', 'CLIENTE'));

    await expect(
      useCase.execute('uid-2', { requesterId: 'uid-1', requesterRole: 'CLIENTE' }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockUserRepo.deactivate).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when target user not found', async () => {
    mockUserRepo.findByIdWithRole.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { requesterId: 'admin-uid', requesterRole: 'ADMIN' }),
    ).rejects.toThrow(NotFoundException);
  });
});
