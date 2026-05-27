import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import type { User } from '@cinema/database';
import { JwtAuthGuard } from './auth.guard';
import { AuthUser, CurrentUser } from './current-user.decorator';
import { SignupUseCase } from './application/signup.use-case';
import { LoginUseCase } from './application/login.use-case';
import { SyncProfileUseCase } from './application/sync-profile.use-case';
import { ResetPasswordUseCase } from './application/reset-password.use-case';
import { RecoverPasswordUseCase } from './application/recover-password.use-case';
import { SUPABASE_AUTH_PORT, SupabaseAuthPort } from './domain/ports/supabase-auth.port';
import { HttpProblemException } from '../common/exceptions/http-problem.exception';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { SyncProfileDto } from './dtos/sync-profile.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RecoverPasswordDto } from './dtos/recover-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly syncProfileUseCase: SyncProfileUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly recoverPasswordUseCase: RecoverPasswordUseCase,
    @Inject(SUPABASE_AUTH_PORT) private readonly supabaseAuth: SupabaseAuthPort,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<User> {
    return this.signupUseCase.execute({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      preferredLanguage: dto.preferredLanguage,
    });
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<{ accessToken: string; userId: string }> {
    return this.loginUseCase.execute({ email: dto.email, password: dto.password });
  }

  @Get('google')
  googleAuth(@Query() dto: GoogleAuthDto): Promise<{ url: string }> {
    return this.supabaseAuth.getGoogleOAuthUrl(dto.redirectTo);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  syncProfile(@CurrentUser() user: AuthUser, @Body() dto: SyncProfileDto): Promise<User> {
    if (!user.email) {
      throw new HttpProblemException({
        type: '/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        message: 'Missing email claim in token.',
      });
    }
    return this.syncProfileUseCase.execute({
      id: user.id,
      email: user.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      preferredLanguage: dto.preferredLanguage,
    });
  }

  @Post('reset-password')
  @HttpCode(204)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.resetPasswordUseCase.execute(dto.email);
  }

  @Post('recover-password')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  recoverPassword(@CurrentUser() user: AuthUser, @Body() dto: RecoverPasswordDto): Promise<void> {
    return this.recoverPasswordUseCase.execute(user.id, dto.newPassword);
  }
}
