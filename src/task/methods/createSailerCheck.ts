import { Bid } from 'src/bid/entities/bid.entity';
import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';
import { Task } from '../entities/task.entity';

export default async function createSailerCheck(bid: Bid) {
  try {
    const result = await Task.create({
      bidId: bid.bidId,
      status: TaskState.New,
      type: TaskType.CheckSeller,
      data: bid.data,
    });
    return result;
  } catch (e) {
    throw e;
  }
}
