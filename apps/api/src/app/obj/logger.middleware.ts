'use strict';
import {NextFunction, Request, Response} from 'express';
import {Injectable, Logger, NestMiddleware} from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    const {ip, method, originalUrl, url} = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const req = {
        ...request
      };
      const {statusCode} = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      this.logger.log(`${method} ${statusCode} ${originalUrl}: ${response.statusMessage}: ${response.get('error.message')}\n(${responseTime})`);
    });

    next();
  }
}
