import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';
import pino, { Logger } from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class PendalLogger extends ConsoleLogger {
  readonly pinoLogger: Logger;
  readonly serviceName = 'pendal';
  constructor() {
    super('Pendal');
    this.pinoLogger = pino({
      level: 'info',
      transport: {
        targets: [
          {
            target: 'pino-elasticsearch',
            options: {
              node: 'http://127.0.0.1:9200',
              index: 'pendal-index',
              esVersion: 8,
              flushBytes: 10,
            },
          },
        ],
      },
    });
  }

  logJson(msg: string, bidId: string, dataObj: object = {}) {
    this.pinoLogger.info({
      bidId,
      serviceName: this.serviceName,
      info: JSON.stringify(dataObj, null, 2),
      msg,
    });
    this.log(msg);
  }

  errorJson(msg: string, bidId: string, dataObj: object = {}) {
    this.pinoLogger.error({
      bidId,
      serviceName: this.serviceName,
      info: JSON.stringify(dataObj, null, 2),
      msg,
    });
    this.error(msg);
  }
}
