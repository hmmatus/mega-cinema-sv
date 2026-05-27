export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  message: string;
  instance?: string;
  details?: Array<{ field: string; message: string }>;
}

export class HttpProblemException extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.message);
    this.name = 'HttpProblemException';
  }
}
