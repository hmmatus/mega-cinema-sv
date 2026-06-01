import { forwardRef, Module } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { USER_REPOSITORY } from './domain/ports/user.repository';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    FindUserUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    AssignRoleUseCase,
  ],
  exports: [USER_REPOSITORY, FindUserUseCase],
})
export class UsersModule {}
