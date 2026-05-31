import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ConfigService } from '@nestjs/config';

const mockFind = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockDeactivate = { execute: jest.fn() };

const mockUser = { id: 'uid-1', email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez', role: { name: 'CLIENTE' } };
const currentUser = { id: 'uid-1', email: 'a@b.com' };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: FindUserUseCase, useValue: mockFind },
        { provide: UpdateUserUseCase, useValue: mockUpdate },
        { provide: DeactivateUserUseCase, useValue: mockDeactivate },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test' } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('GET /users/me delegates to FindUserUseCase with current user id', async () => {
    mockFind.execute.mockResolvedValue(mockUser);

    const result = await controller.getMe(currentUser as any);

    expect(mockFind.execute).toHaveBeenCalledWith('uid-1');
    expect(result).toEqual(mockUser);
  });

  it('PATCH /users/me delegates to UpdateUserUseCase', async () => {
    const updated = { ...mockUser, firstName: 'Updated' };
    mockUpdate.execute.mockResolvedValue(updated);

    const result = await controller.updateMe(currentUser as any, { firstName: 'Updated' });

    expect(mockUpdate.execute).toHaveBeenCalledWith('uid-1', { firstName: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('DELETE /users/:id delegates to DeactivateUserUseCase with requester context', async () => {
    const deactivated = { ...mockUser, status: 'INACTIVE' };
    mockDeactivate.execute.mockResolvedValue(deactivated);

    // User deactivating themselves — FindUserUseCase not invoked for context here
    // We need requester role, so the controller must fetch it first
    mockFind.execute.mockResolvedValue(mockUser);
    const result = await controller.deactivate(currentUser as any, 'uid-1');

    expect(mockDeactivate.execute).toHaveBeenCalledWith('uid-1', {
      requesterId: 'uid-1',
      requesterRole: 'CLIENTE',
    });
    expect(result).toEqual(deactivated);
  });
});
