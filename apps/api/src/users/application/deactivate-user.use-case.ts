import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@cinema/database';
import { USER_REPOSITORY, UserRepository } from '../domain/ports/user.repository';

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
    if (!target) throw new NotFoundException('User not found');

    const isSelf = ctx.requesterId === targetId;
    const isAdmin = ctx.requesterRole === 'ADMIN';

    if (!isSelf && !isAdmin) throw new ForbiddenException('Cannot deactivate another user');

    return this.userRepo.deactivate(targetId);
  }
}
