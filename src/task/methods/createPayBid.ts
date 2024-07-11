import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';
import { Task } from '../entities/task.entity';
import { IPay } from 'src/types/invoce';

export default async function createPayBid(dto: IPay) {
  try {
    const result = await Task.create({
      bidId: dto.bidId,
      data: JSON.stringify(dto),
      type: TaskType.CheckPay,
      status: TaskState.New,
    });
    return result;
  } catch (e) {
    throw e;
  }
}
