import { TaskService } from '../task.service';
import getDocumentByNum from './getDocumentNumberByNum';

export default async function getDocumentState(
  taskService: TaskService,
  boxId: string,
  messageId: string,
  docNumber: string,
): Promise<string> {
  const document = await getDocumentByNum(
    taskService,
    boxId,
    messageId,
    docNumber,
  );
  return document.DocflowStatus.PrimaryStatus.StatusText;
}
