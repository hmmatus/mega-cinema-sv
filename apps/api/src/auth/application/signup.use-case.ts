import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../../users/domain/ports/user.repository';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from '../domain/ports/supabase-auth.port';

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
}

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  async execute(input: SignupInput): Promise<User> {
    const { id } = await this.supabaseAuth.createUser(input.email, input.password);

    try {
      return await this.userRepo.create({
        id,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        preferredLanguage: input.preferredLanguage,
      });
    } catch (err: unknown) {
      await this.supabaseAuth.deleteUser(id).catch(() => undefined);

      // Prisma unique violation (P2002) → email already registered
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }
}
