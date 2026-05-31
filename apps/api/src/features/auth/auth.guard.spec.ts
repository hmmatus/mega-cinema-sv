import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from './auth.guard';

function mockContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authHeader ? { authorization: authHeader } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
              if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
              throw new Error(`Missing config: ${key}`);
            },
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('is defined', () => {
    expect(guard).toBeDefined();
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when header is not Bearer scheme', async () => {
    await expect(
      guard.canActivate(mockContext('Basic dXNlcjpwYXNz')),
    ).rejects.toThrow(UnauthorizedException);
  });
});
