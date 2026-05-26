import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SignupUseCase } from './application/signup.use-case';
import { LoginUseCase } from './application/login.use-case';
import { SyncProfileUseCase } from './application/sync-profile.use-case';
import { ResetPasswordUseCase } from './application/reset-password.use-case';
import { RecoverPasswordUseCase } from './application/recover-password.use-case';
import { JwtAuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { SUPABASE_AUTH_PORT } from './domain/ports/supabase-auth.port';

const mockSignup = { execute: jest.fn() };
const mockLogin = { execute: jest.fn() };
const mockSync = { execute: jest.fn() };
const mockReset = { execute: jest.fn() };
const mockRecover = { execute: jest.fn() };
const mockSupabaseAuth = { getGoogleOAuthUrl: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: mockSignup },
        { provide: LoginUseCase, useValue: mockLogin },
        { provide: SyncProfileUseCase, useValue: mockSync },
        { provide: ResetPasswordUseCase, useValue: mockReset },
        { provide: RecoverPasswordUseCase, useValue: mockRecover },
        { provide: SUPABASE_AUTH_PORT, useValue: mockSupabaseAuth },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test' } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('POST /auth/signup delegates to SignupUseCase', async () => {
    const user = { id: 'uid-1', email: 'a@b.com' };
    mockSignup.execute.mockResolvedValue(user);

    const result = await controller.signup({
      email: 'a@b.com',
      password: 'secret123',
      firstName: 'Ana',
      lastName: 'Lopez',
    });

    expect(mockSignup.execute).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret123',
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual(user);
  });

  it('POST /auth/login delegates to LoginUseCase', async () => {
    mockLogin.execute.mockResolvedValue({ accessToken: 'tok', userId: 'uid-1' });

    const result = await controller.login({ email: 'a@b.com', password: 'secret123' });

    expect(result).toEqual({ accessToken: 'tok', userId: 'uid-1' });
  });

  it('GET /auth/google returns OAuth url', async () => {
    mockSupabaseAuth.getGoogleOAuthUrl.mockResolvedValue({ url: 'https://google.com/oauth' });

    const result = await controller.googleAuth({ redirectTo: 'https://app.com/callback' });

    expect(result).toEqual({ url: 'https://google.com/oauth' });
  });

  it('POST /auth/sync delegates to SyncProfileUseCase with current user', async () => {
    const user = { id: 'uid-1', email: 'a@b.com' };
    mockSync.execute.mockResolvedValue(user);

    const currentUser = { id: 'uid-1', email: 'a@b.com' };
    const result = await controller.syncProfile(currentUser as any, {
      firstName: 'Ana',
      lastName: 'Lopez',
    });

    expect(mockSync.execute).toHaveBeenCalledWith({
      id: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      preferredLanguage: undefined,
    });
    expect(result).toEqual(user);
  });

  it('POST /auth/reset-password delegates to ResetPasswordUseCase', async () => {
    mockReset.execute.mockResolvedValue(undefined);

    await expect(controller.resetPassword({ email: 'a@b.com' })).resolves.toBeUndefined();
    expect(mockReset.execute).toHaveBeenCalledWith('a@b.com');
  });

  it('POST /auth/recover-password delegates to RecoverPasswordUseCase', async () => {
    mockRecover.execute.mockResolvedValue(undefined);

    await expect(
      controller.recoverPassword({ id: 'uid-1', email: 'a@b.com' } as any, { newPassword: 'newpass123' }),
    ).resolves.toBeUndefined();
    expect(mockRecover.execute).toHaveBeenCalledWith('uid-1', 'newpass123');
  });
});
