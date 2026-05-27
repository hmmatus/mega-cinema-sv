import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository, UserWithRole } from '../domain/ports/user.repository';
import { HttpProblemException } from '../../common/exceptions/http-problem.exception';

@Injectable()
export class FindUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(id: string): Promise<UserWithRole> {
    const user = await this.userRepo.findByIdWithRole(id);
    if (!user) {
      throw new HttpProblemException({
        type: '/problems/user-not-found',
        title: 'User Not Found',
        status: 404,
        message: 'The requested user does not exist.',
      });
    }
    return user;
  }
}
