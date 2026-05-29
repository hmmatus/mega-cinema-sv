import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import type { User } from '@cinema/database';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { UpdateUserDto } from './dtos/update-user.dto';
import type { UserWithRole } from './domain/ports/user.repository';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser): Promise<UserWithRole> {
    return this.findUserUseCase.execute(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async deactivate(@CurrentUser() user: AuthUser, @Param('id') targetId: string): Promise<User> {
    const requester = await this.findUserUseCase.execute(user.id);
    return this.deactivateUserUseCase.execute(targetId, {
      requesterId: user.id,
      requesterRole: requester.role.name,
    });
  }
}
