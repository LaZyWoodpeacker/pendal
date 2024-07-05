import { Injectable } from '@nestjs/common';
import { TaskService } from './task/task.service';
import { Task } from './task/entities/task.entity';
import { TaskState } from './task/types/status.task';
import { TaskType } from './task/types/type.task';
import { PendalLogger } from './pendal-logger/pendal-logger.service';
import { IBid, IPay } from './types/invoce';
import { BidService } from './bid/bid.service';

@Injectable()
export class AppService {
  constructor(
    readonly bids: BidService,
    readonly taskService: TaskService,
    readonly logger: PendalLogger,
  ) {}

  async createBid(dto: IBid): Promise<Task> {
    const bid = await this.bids.create(dto);
    this.bids.logBid(bid, `Создана заявка`);
    const task = await this.taskService.create({
      bidId: dto.bidId,
      data: JSON.stringify(dto),
      type: TaskType.NewBid,
      status: TaskState.New,
    });
    return task;
  }

  async payBid(dto: IPay) {
    try {
      const task = await this.taskService.create({
        bidId: dto.bidId,
        data: JSON.stringify(dto),
        type: TaskType.CheckPay,
        status: TaskState.New,
      });
      this.logger.log(`Оплата по заявке ${dto.bidId} создана `);
      return task;
    } catch (e) {}
  }
}
