import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from './entities/task.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BidModule } from 'src/bid/bid.module';
import { DiadocModule } from 'src/diadoc/diadoc.module';
import { OnecModule } from 'src/onec/onec.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Task]),
    ScheduleModule.forRoot(),
    BidModule,
    DiadocModule,
    OnecModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
