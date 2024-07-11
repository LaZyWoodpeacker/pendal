import { Bid } from 'src/bid/entities/bid.entity';
import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';
import { Task } from '../entities/task.entity';

export default async function createDealFinished(bid: Bid) {
  try {
    const result = await Task.create({
      bidId: bid.bidId,
      data: null,
      status: TaskState.New,
      type: TaskType.DealFinished,
    });
    return result;
  } catch (e) {
    throw e;
  }
}
