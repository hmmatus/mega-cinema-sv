import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../../users/domain/ports/user.repository';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

export interface SyncProfileInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  currentRole: string;
}

@Injectable()
export class SyncProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  async execute(input: SyncProfileInput): Promise<User> {
    const user = await this.userRepo.findById(input.id);
    if (!user) {
      throw new HttpProblemException({
        type: '/problems/user-not-found',
        title: 'User Not Found',
        status: 404,
        message: 'User profile not found.',
      });
    }

    const updated = await this.userRepo.update(input.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
    });

    // Set default role on first login — skip if already admin or employee
    if (input.currentRole !== 'admin' && input.currentRole !== 'employee') {
      await this.supabaseAuth.updateUserRole(input.id, 'user');
    }

    return updated;
  }
}
