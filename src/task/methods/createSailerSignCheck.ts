import { Bid } from 'src/bid/entities/bid.entity';
import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';
import { Task } from '../entities/task.entity';

export default async function createSailerSignCheck(bid: Bid, data: Object) {
  try {
    const result = await Task.create({
      bidId: bid.bidId,
      status: TaskState.New,
      type: TaskType.CheckDiadocSailer,
      data: JSON.stringify(data),
    });
    return result;
  } catch (e) {
    throw e;
  }
}
