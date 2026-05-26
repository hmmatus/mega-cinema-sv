import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string; userId: string }> {
    return this.supabaseAuth.signInWithPassword(input.email, input.password);
  }
}
