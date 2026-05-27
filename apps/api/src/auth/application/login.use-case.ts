import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';
import { USER_REPOSITORY, UserRepository } from '../../users/domain/ports/user.repository';
import { HttpProblemException } from '../../common/exceptions/http-problem.exception';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string; userId: string }> {
    const result = await this.supabaseAuth.signInWithPassword(input.email, input.password);

    const user = await this.userRepo.findById(result.userId);
    if (user?.status === 'INACTIVE') {
      throw new HttpProblemException({
        type: '/problems/account-inactive',
        title: 'Account Inactive',
        status: 401,
        message: 'This account has been deactivated.',
      });
    }

    return result;
  }
}
