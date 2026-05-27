import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { ProblemExceptionFilter } from './common/filters/problem-exception.filter';
import { HttpProblemException } from './common/exceptions/http-problem.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ProblemExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const details = errors.flatMap((err) =>
          Object.values(err.constraints ?? {}).map((message) => ({
            field: err.property,
            message,
          })),
        );
        return new HttpProblemException({
          type: 'about:blank',
          title: 'Validation Error',
          status: 422,
          message: 'Request validation failed.',
          details,
        });
      },
    }),
  );
  app.setGlobalPrefix('api');
  const allowedOrigins = [
    process.env.WEB_FRONTEND_URL ?? 'http://localhost:3000',
    process.env.ADMIN_FRONTEND_URL ?? 'http://localhost:3002',
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api`);
}

bootstrap();
