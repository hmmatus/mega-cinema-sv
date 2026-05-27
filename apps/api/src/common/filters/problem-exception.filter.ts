import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HttpProblemException } from '../exceptions/http-problem.exception';

@Catch()
export class ProblemExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = ctx.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request: any = ctx.getRequest();

    if (exception instanceof HttpProblemException) {
      const body = {
        type: exception.problem.type,
        title: exception.problem.title,
        status: exception.problem.status,
        message: exception.problem.message,
        instance: exception.problem.instance ?? request.url,
        ...(exception.problem.details ? { details: exception.problem.details } : {}),
      };
      response
        .status(exception.problem.status)
        .set('Content-Type', 'application/problem+json')
        .json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exResponse = exception.getResponse();
      const message =
        typeof exResponse === 'string'
          ? exResponse
          : ((exResponse as Record<string, unknown>).message?.toString() ?? 'An error occurred');
      response
        .status(status)
        .set('Content-Type', 'application/problem+json')
        .json({
          type: 'about:blank',
          title: exception.name,
          status,
          message,
          instance: request.url,
        });
      return;
    }

    response
      .status(500)
      .set('Content-Type', 'application/problem+json')
      .json({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        message: 'An unexpected error occurred.',
        instance: request.url,
      });
  }
}
