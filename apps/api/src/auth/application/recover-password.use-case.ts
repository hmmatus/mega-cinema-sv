import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';

@Injectable()
export class RecoverPasswordUseCase {
  constructor(
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  execute(userId: string, newPassword: string): Promise<void> {
    return this.supabaseAuth.updatePassword(userId, newPassword);
  }
}
