import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../../users/domain/ports/user.repository';

export interface SyncProfileInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
}

@Injectable()
export class SyncProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(input: SyncProfileInput): Promise<User> {
    const existing = await this.userRepo.findById(input.id);
    if (existing) return existing;

    return this.userRepo.create({
      id: input.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
    });
  }
}
