import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { MoviesModule } from './features/movies/movies.module';

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
    PrismaModule,
    AuthModule,
    UsersModule,
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
