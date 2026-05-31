import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { USER_REPOSITORY } from './domain/ports/user.repository';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    FindUserUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    AssignRoleUseCase,
  ],
  exports: [USER_REPOSITORY, FindUserUseCase],
})
export class UsersModule {}
