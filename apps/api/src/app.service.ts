import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@cinema/shared';

@Injectable()
export class AppService {
  health(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
