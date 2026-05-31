import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../../users/domain/ports/user.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

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
    const user = await this.userRepo.findById(input.id);
    if (!user) {
      throw new HttpProblemException({
        type: '/problems/user-not-found',
        title: 'User Not Found',
        status: 404,
        message: 'User profile not found.',
      });
    }
    return this.userRepo.update(input.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
    });
  }
}
