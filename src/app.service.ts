import { Injectable } from '@nestjs/common';
import { TaskService } from './task/task.service';
import { Task } from './task/entities/task.entity';
import { TaskState } from './task/types/status.task';
import { TaskType } from './task/types/type.task';
import { PendalLogger } from './pendal-logger/pendal-logger.service';
import { IBid, IPay } from './types/invoce';
import { BidService } from './bid/bid.service';
import createPayBid from './task/methods/createPayBid';
import createBid from './task/methods/createBid';

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
    const task = await createBid(dto);
    return task;
  }

  async payBid(dto: IPay) {
    try {
      const task = await createPayBid(dto);
      this.logger.log(`Оплата по заявке ${dto.bidId} создана `);
      return task;
    } catch (e) {}
  }
}
