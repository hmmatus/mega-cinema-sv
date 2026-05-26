import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository, UserWithRole } from '../domain/ports/user.repository';

@Injectable()
export class FindUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(id: string): Promise<UserWithRole> {
    const user = await this.userRepo.findByIdWithRole(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
