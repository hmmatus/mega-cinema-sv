import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from './current-user.decorator';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!roles || roles.length === 0) return true;

    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const userRole = request.user?.role;

    if (!roles.includes(userRole)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
