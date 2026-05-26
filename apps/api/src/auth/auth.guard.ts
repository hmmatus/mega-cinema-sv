import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage } from 'http';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IncomingMessage & { user?: unknown }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = authHeader.slice(7);
    const supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.auth as any).getUser(token) as {
      data: { user: unknown };
      error: unknown;
    };

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = data.user;
    return true;
  }
}
