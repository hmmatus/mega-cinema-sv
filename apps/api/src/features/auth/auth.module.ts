import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { AuthController } from './auth.controller';
import { SupabaseAuthAdapter } from './infrastructure/adapters/supabase-auth.adapter';
import { SUPABASE_AUTH_PORT } from './domain/ports/supabase-auth.port';
import { SignupUseCase } from './application/signup.use-case';
import { LoginUseCase } from './application/login.use-case';
import { SyncProfileUseCase } from './application/sync-profile.use-case';
import { ResetPasswordUseCase } from './application/reset-password.use-case';
import { RecoverPasswordUseCase } from './application/recover-password.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    { provide: SUPABASE_AUTH_PORT, useClass: SupabaseAuthAdapter },
    SignupUseCase,
    LoginUseCase,
    SyncProfileUseCase,
    ResetPasswordUseCase,
    RecoverPasswordUseCase,
  ],
  exports: [JwtAuthGuard, RolesGuard, SUPABASE_AUTH_PORT],
})
export class AuthModule {}
