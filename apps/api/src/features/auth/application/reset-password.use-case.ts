import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  execute(email: string): Promise<void> {
    return this.supabaseAuth.sendPasswordResetEmail(email);
  }
}
