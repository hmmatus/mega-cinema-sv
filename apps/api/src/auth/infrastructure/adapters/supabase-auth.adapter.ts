import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseAuthPort } from '../../domain/ports/supabase-auth.port';

@Injectable()
export class SupabaseAuthAdapter implements SupabaseAuthPort {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async createUser(email: string, password: string): Promise<{ id: string; email: string }> {
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new InternalServerErrorException(error?.message ?? 'Failed to create user');
    return { id: data.user.id, email: data.user.email! };
  }

  async signInWithPassword(email: string, password: string): Promise<{ accessToken: string; userId: string }> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    return { accessToken: data.session.access_token, userId: data.session.user.id };
  }

  async getGoogleOAuthUrl(redirectTo: string): Promise<{ url: string }> {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new InternalServerErrorException(error?.message ?? 'Failed to get OAuth URL');
    return { url: data.url };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw new InternalServerErrorException(error.message);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(userId, { password: newPassword });
    if (error) throw new InternalServerErrorException(error.message);
  }
}
