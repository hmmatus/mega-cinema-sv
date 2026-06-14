import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { AuditModule } from './features/audit/audit.module';
import { MoviesModule } from './features/movies/movies.module';
import { LocationsModule } from './features/locations/locations.module';
import { BannersModule } from './features/banners/banners.module';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        join(__dirname, '../../../.env.local'),
        join(__dirname, '../../../.env'),
      ],
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    MoviesModule,
    LocationsModule,
    BannersModule,
  ],
  controllers: [AppController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
