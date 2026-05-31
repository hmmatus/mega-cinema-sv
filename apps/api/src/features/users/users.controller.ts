import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import type { User } from '@cinema/database';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { FindUserUseCase } from './application/find-user.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AssignRoleDto } from './dtos/assign-role.dto';
import type { UserWithRole } from './domain/ports/user.repository';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
  ) {}

  @Get('')
  getMe(@CurrentUser() user: AuthUser): Promise<UserWithRole> {
    return this.findUserUseCase.execute(user.id);
  }

  @Patch('')
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.updateUserUseCase.execute(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('admin')
  deactivate(@Param('id') targetId: string): Promise<User> {
    return this.deactivateUserUseCase.execute(targetId);
  }

  @Patch(':id/role')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('admin')
  assignRole(
    @Param('id') targetId: string,
    @Body() dto: AssignRoleDto,
  ): Promise<void> {
    return this.assignRoleUseCase.execute(targetId, dto.role);
  }
}
