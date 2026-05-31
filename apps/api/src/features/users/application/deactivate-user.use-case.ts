import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../domain/ports/user.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

export interface DeactivateContext {
  requesterId: string;
  requesterRole: string;
}

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(targetId: string, ctx: DeactivateContext): Promise<User> {
    const target = await this.userRepo.findByIdWithRole(targetId);
    if (!target) {
      throw new HttpProblemException({
        type: '/problems/user-not-found',
        title: 'User Not Found',
        status: 404,
        message: 'The requested user does not exist.',
      });
    }

    const isSelf = ctx.requesterId === targetId;
    const isAdmin = ctx.requesterRole === 'ADMIN';

    if (!isSelf && !isAdmin) {
      throw new HttpProblemException({
        type: '/problems/forbidden',
        title: 'Forbidden',
        status: 403,
        message: 'You do not have permission to deactivate this account.',
      });
    }

    if (isAdmin && !isSelf && target.role.name === 'ADMIN') {
      throw new HttpProblemException({
        type: '/problems/forbidden',
        title: 'Forbidden',
        status: 403,
        message: 'An admin cannot deactivate another admin account.',
      });
    }

    return this.userRepo.deactivate(targetId);
  }
}
