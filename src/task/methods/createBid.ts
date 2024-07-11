import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';
import { Task } from '../entities/task.entity';
import { IBid } from 'src/types/invoce';

export default async function createBid(dto: IBid) {
  try {
    const result = await Task.create({
      bidId: dto.bidId,
      data: JSON.stringify(dto),
      type: TaskType.NewBid,
      status: TaskState.New,
    });
    return result;
  } catch (e) {
    throw e;
  }
}
