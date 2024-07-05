import { Global, Module } from '@nestjs/common';
import { PendalLogger } from './pendal-logger.service';

@Global()
@Module({
  providers: [PendalLogger],
  exports: [PendalLogger],
})
export class PendalLoggerModule {}
