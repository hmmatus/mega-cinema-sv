import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseAuthPort } from '../../domain/ports/supabase-auth.port';

// SupabaseAuthClient type chain is unresolvable in pnpm virtual-store context.
// Runtime methods (admin, signInWithPassword, etc.) exist; cast to bypass TS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAuth = any;

@Injectable()
export class SupabaseAuthAdapter implements SupabaseAuthPort {
  private readonly auth: AnyAuth;
  private readonly allowedRedirectOrigins: Set<string>;

  constructor(private readonly config: ConfigService) {
    const client = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.auth = client.auth;
    this.allowedRedirectOrigins = new Set(
      config.getOrThrow<string>('OAUTH_ALLOWED_REDIRECT_ORIGINS')
        .split(',')
        .map((v) => v.trim()),
    );
  }

  async createUser(email: string, password: string): Promise<{ id: string; email: string }> {
    const { data, error } = await this.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new InternalServerErrorException(error?.message ?? 'Failed to create user');
    return { id: data.user.id, email: data.user.email };
  }

  async signInWithPassword(email: string, password: string): Promise<{ accessToken: string; userId: string }> {
    const { data, error } = await this.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    return { accessToken: data.session.access_token, userId: data.session.user.id };
  }

  async getGoogleOAuthUrl(redirectTo: string): Promise<{ url: string }> {
    const origin = new URL(redirectTo).origin;
    if (!this.allowedRedirectOrigins.has(origin)) {
      throw new BadRequestException('Untrusted redirect origin');
    }
    const { data, error } = await this.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new InternalServerErrorException(error?.message ?? 'Failed to get OAuth URL');
    return { url: data.url };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.auth.resetPasswordForEmail(email);
    if (error) throw new InternalServerErrorException(error.message);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await this.auth.admin.updateUserById(userId, { password: newPassword });
    if (error) throw new InternalServerErrorException(error.message);
  }
}
