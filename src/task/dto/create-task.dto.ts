import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';

export class CreateTaskDto {
  bidId: string;
  data: string;
  type: TaskType;
  status: TaskState;
}
