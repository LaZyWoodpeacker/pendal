import { Module } from '@nestjs/common';
import { DiadocService } from './diadoc.service';
import { DiadocController } from './diadoc.controller';

@Module({
  controllers: [DiadocController],
  providers: [DiadocService],
  exports: [DiadocService],
})
export class DiadocModule {}
