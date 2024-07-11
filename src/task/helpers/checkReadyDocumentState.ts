import { TaskService } from '../task.service';
import getDocumentState from './getDocumentState';

export default async function checkReadyDocumentState(
  taskService: TaskService,
  boxId: string,
  messageId: string,
  number: string,
): Promise<boolean> {
  const status = await getDocumentState(taskService, boxId, messageId, number);
  return (
    status === 'Документооборот завершен' || status === 'Подписан контрагентом'
  );
}
