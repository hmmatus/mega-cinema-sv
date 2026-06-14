import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SupabaseAuthAdapter } from './supabase-auth.adapter';

const mockAdminAuth = {
  createUser: vi.fn(),
  admin: {
    createUser: vi.fn(),
    updateUserById: vi.fn(),
    deleteUser: vi.fn(),
  },
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: mockAdminAuth })),
}));

describe('SupabaseAuthAdapter', () => {
  let adapter: SupabaseAuthAdapter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SupabaseAuthAdapter,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const map: Record<string, string> = {
                SUPABASE_URL: 'https://example.supabase.co',
                SUPABASE_ANON_KEY: 'anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'service-key',
                OAUTH_ALLOWED_REDIRECT_ORIGINS: 'https://app.com,http://localhost:3000',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    adapter = module.get(SupabaseAuthAdapter);
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('creates user and returns id + email', async () => {
      mockAdminAuth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'uid-1', email: 'a@b.com' } },
        error: null,
      });

      const result = await adapter.createUser('a@b.com', 'password123');
      expect(result).toEqual({ id: 'uid-1', email: 'a@b.com' });
      expect(mockAdminAuth.admin.createUser).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'password123',
        email_confirm: true,
      });
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
      mockAdminAuth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(adapter.createUser('a@b.com', 'password123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signInWithPassword', () => {
    it('returns accessToken and userId on success', async () => {
      mockAdminAuth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'tok', user: { id: 'uid-1' } } },
        error: null,
      });

      const result = await adapter.signInWithPassword('a@b.com', 'password123');
      expect(result).toEqual({ accessToken: 'tok', userId: 'uid-1' });
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      mockAdminAuth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(adapter.signInWithPassword('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getGoogleOAuthUrl', () => {
    it('returns OAuth url', async () => {
      mockAdminAuth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/o/oauth2/auth?...' },
        error: null,
      });

      const result = await adapter.getGoogleOAuthUrl('https://app.com/callback');
      expect(result).toEqual({ url: 'https://accounts.google.com/o/oauth2/auth?...' });
    });

    it('throws InternalServerErrorException when url is null', async () => {
      mockAdminAuth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: null,
      });

      await expect(adapter.getGoogleOAuthUrl('https://app.com/callback')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws BadRequestException for untrusted redirect origin', async () => {
      await expect(adapter.getGoogleOAuthUrl('https://evil.com/callback')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAdminAuth.signInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('calls Supabase resetPasswordForEmail', async () => {
      mockAdminAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await expect(adapter.sendPasswordResetEmail('a@b.com')).resolves.toBeUndefined();
      expect(mockAdminAuth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com');
    });

    it('throws InternalServerErrorException on error', async () => {
      mockAdminAuth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'fail' } });

      await expect(adapter.sendPasswordResetEmail('a@b.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updatePassword', () => {
    it('updates password via admin SDK', async () => {
      mockAdminAuth.admin.updateUserById.mockResolvedValue({ error: null });

      await expect(adapter.updatePassword('uid-1', 'newpass123')).resolves.toBeUndefined();
      expect(mockAdminAuth.admin.updateUserById).toHaveBeenCalledWith('uid-1', {
        password: 'newpass123',
      });
    });

    it('throws InternalServerErrorException on error', async () => {
      mockAdminAuth.admin.updateUserById.mockResolvedValue({ error: { message: 'fail' } });

      await expect(adapter.updatePassword('uid-1', 'newpass123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteUser', () => {
    it('deletes user via admin SDK', async () => {
      mockAdminAuth.admin.deleteUser = vi.fn().mockResolvedValue({ error: null });

      await expect(adapter.deleteUser('uid-1')).resolves.toBeUndefined();
      expect(mockAdminAuth.admin.deleteUser).toHaveBeenCalledWith('uid-1');
    });

    it('throws InternalServerErrorException on error', async () => {
      mockAdminAuth.admin.deleteUser = vi.fn().mockResolvedValue({ error: { message: 'fail' } });

      await expect(adapter.deleteUser('uid-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUserRole', () => {
    it('sets app_metadata.role via admin SDK', async () => {
      mockAdminAuth.admin.updateUserById.mockResolvedValue({ error: null });

      await expect(adapter.updateUserRole('uid-1', 'employee')).resolves.toBeUndefined();
      expect(mockAdminAuth.admin.updateUserById).toHaveBeenCalledWith('uid-1', {
        app_metadata: { role: 'employee' },
      });
    });

    it('throws InternalServerErrorException on error', async () => {
      mockAdminAuth.admin.updateUserById.mockResolvedValue({ error: { message: 'fail' } });

      await expect(adapter.updateUserRole('uid-1', 'admin')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
