import { Module } from '@nestjs/common';
import { OnecService } from './onec.service';
import { DiadocModule } from 'src/diadoc/diadoc.module';
import { OnecController } from './onec.controller';

@Module({
  imports: [DiadocModule],
  controllers: [OnecController],
  providers: [OnecService],
  exports: [OnecService],
})
export class OnecModule {}
