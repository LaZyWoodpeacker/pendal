import { Task } from '../entities/task.entity';
import { TaskService } from '../task.service';
import { TaskType } from '../types/type.task';

export default function logTaskObj(
  { logger }: TaskService,
  task: Task,
  obj: Object,
  message: string = null,
): void {
  if (!message) {
    this.logger.logJson(
      `Обработка задачи с типом  ${TaskType[task.type]} к заявке ${task.bidId}`,
      task.bidId,
      obj,
    );
  } else {
    logger.logJson(message, task.bidId, obj);
  }
}
