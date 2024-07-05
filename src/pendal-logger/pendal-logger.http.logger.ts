import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PendalLogger } from './pendal-logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: PendalLogger) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (['/createbid', '/paybid'].includes(req.baseUrl)) {
      this.logger.logJson(
        `HTTP запрос ${req.baseUrl} ${req.hostname}`,
        'bidId' in req.body ? req.body.bidId : '',
        req.body,
      );
    }
    next();
  }
}
