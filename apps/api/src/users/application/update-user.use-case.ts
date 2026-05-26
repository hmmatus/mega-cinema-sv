import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@cinema/database';
import { UpdateUserData, USER_REPOSITORY, UserRepository } from '../domain/ports/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepo.update(id, data);
  }
}
