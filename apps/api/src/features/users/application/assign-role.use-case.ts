import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../../auth/domain/ports/supabase-auth.port';

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  async execute(targetId: string, role: string): Promise<void> {
    await this.supabaseAuth.updateUserRole(targetId, role);
  }
}
