import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';

function makeContext(role: string, handler: object = {}, cls: object = {}): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 'uid-1', email: 'a@b.com', role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when no @Roles() metadata is set', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(makeContext('user'))).toBe(true);
  });

  it('allows access when user role matches required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(guard.canActivate(makeContext('admin'))).toBe(true);
  });

  it('allows access when user role is one of multiple allowed roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'employee']);
    expect(guard.canActivate(makeContext('employee'))).toBe(true);
  });

  it('throws ForbiddenException when user role is not in allowed roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext('user'))).toThrow(ForbiddenException);
  });

  it('uses ROLES_KEY when reading metadata', () => {
    const spy = vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const ctx = makeContext('admin');
    guard.canActivate(ctx);
    expect(spy).toHaveBeenCalledWith(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
  });
});
