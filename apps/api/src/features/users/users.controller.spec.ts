import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

const mockFind = { execute: vi.fn() };
const mockUpdate = { execute: vi.fn() };
const mockDeactivate = { execute: vi.fn() };
const mockAssignRole = { execute: vi.fn() };

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez', role: { name: 'user' } };
const currentUser = { id: 'uid-1', email: 'a@b.com', role: 'user' };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: FindUserUseCase, useValue: mockFind },
        { provide: UpdateUserUseCase, useValue: mockUpdate },
        { provide: DeactivateUserUseCase, useValue: mockDeactivate },
        { provide: AssignRoleUseCase, useValue: mockAssignRole },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
    vi.clearAllMocks();
  });

  it('GET /users delegates to FindUserUseCase with current user id', async () => {
    mockFind.execute.mockResolvedValue(mockUser);

    const result = await controller.getMe(currentUser as any);

    expect(mockFind.execute).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual(mockUser);
  });

  it('PATCH /users delegates to UpdateUserUseCase', async () => {
    const updated = { ...mockUser, firstName: 'Updated' };
    mockUpdate.execute.mockResolvedValue(updated);

    const result = await controller.updateMe(currentUser as any, { firstName: 'Updated' });

    expect(mockUpdate.execute).toHaveBeenCalledWith('uid-1', { firstName: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('DELETE /users/:id delegates to DeactivateUserUseCase with targetId only', async () => {
    const deactivated = { ...mockUser, status: 'INACTIVE' };
    mockDeactivate.execute.mockResolvedValue(deactivated);

    const result = await controller.deactivate('uid-2');

    expect(mockDeactivate.execute).toHaveBeenCalledWith('uid-2');
    expect(result).toEqual(deactivated);
  });

  it('PATCH /users/:id/role delegates to AssignRoleUseCase', async () => {
    mockAssignRole.execute.mockResolvedValue(undefined);

    await controller.assignRole('uid-2', { role: 'employee' });

    expect(mockAssignRole.execute).toHaveBeenCalledWith('uid-2', 'employee');
  });
});
