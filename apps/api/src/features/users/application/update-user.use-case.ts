import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { UpdateUserData, USER_REPOSITORY, UserRepository } from '../domain/ports/user.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new HttpProblemException({
        type: '/problems/user-not-found',
        title: 'User Not Found',
        status: 404,
        message: 'The requested user does not exist.',
      });
    }
    return this.userRepo.update(id, data);
  }
}
