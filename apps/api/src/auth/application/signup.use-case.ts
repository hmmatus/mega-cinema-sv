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
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new ConflictException('Email already registered');

    const { id } = await this.supabaseAuth.createUser(input.email, input.password);

    return this.userRepo.create({
      id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
    });
  }
}
