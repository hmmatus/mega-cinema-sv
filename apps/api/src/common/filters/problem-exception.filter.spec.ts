import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProblemExceptionFilter } from './problem-exception.filter';
import { HttpProblemException } from '../exceptions/http-problem.exception';

function makeHost(url = '/api/test') {
  const json = vi.fn();
  const set = vi.fn().mockReturnThis();
  const status = vi.fn().mockReturnValue({ set, json });
  const response = { status };
  const request = { url };
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
    json,
    status,
    set,
  };
}

describe('ProblemExceptionFilter', () => {
  let filter: ProblemExceptionFilter;

  beforeEach(() => {
    filter = new ProblemExceptionFilter();
  });

  it('serializes HttpProblemException with correct structure', () => {
    const host = makeHost('/api/auth/signup') as any;
    const exception = new HttpProblemException({
      type: '/problems/email-already-registered',
      title: 'Email Already Registered',
      status: 409,
      message: 'The email address is already associated with an existing account.',
    });

    filter.catch(exception, host);

    expect(host.status).toHaveBeenCalledWith(409);
    expect(host.set).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '/problems/email-already-registered',
        title: 'Email Already Registered',
        status: 409,
        message: expect.any(String),
        instance: '/api/auth/signup',
      }),
    );
  });

  it('includes details[] for validation HttpProblemException', () => {
    const host = makeHost('/api/auth/signup') as any;
    const exception = new HttpProblemException({
      type: 'about:blank',
      title: 'Validation Error',
      status: 422,
      message: 'Request validation failed.',
      details: [
        { field: 'email', message: 'must be an email' },
        { field: 'password', message: 'must be longer than or equal to 8 characters' },
      ],
    });

    filter.catch(exception, host);

    expect(host.status).toHaveBeenCalledWith(422);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 422,
        details: [
          { field: 'email', message: 'must be an email' },
          { field: 'password', message: 'must be longer than or equal to 8 characters' },
        ],
      }),
    );
  });

  it('uses request.url as instance when not in problem', () => {
    const host = makeHost('/api/users/me') as any;
    const exception = new HttpProblemException({
      type: '/problems/user-not-found',
      title: 'User Not Found',
      status: 404,
      message: 'The requested user does not exist.',
    });

    filter.catch(exception, host);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ instance: '/api/users/me' }),
    );
  });

  it('converts ForbiddenException to application/problem+json 403', () => {
    const host = makeHost() as any;
    filter.catch(new ForbiddenException('Not allowed'), host);

    expect(host.status).toHaveBeenCalledWith(403);
    expect(host.set).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, type: 'about:blank' }),
    );
  });

  it('converts BadRequestException to application/problem+json 400', () => {
    const host = makeHost() as any;
    filter.catch(new BadRequestException('Bad input'), host);

    expect(host.status).toHaveBeenCalledWith(400);
    expect(host.json).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('returns 500 for unknown errors', () => {
    const host = makeHost() as any;
    filter.catch(new Error('boom'), host);

    expect(host.status).toHaveBeenCalledWith(500);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        title: 'Internal Server Error',
      }),
    );
  });
});
