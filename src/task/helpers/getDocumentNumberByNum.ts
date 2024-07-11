import { TaskService } from '../task.service';
import { writeFileSync } from 'fs';
import { IDocument } from 'src/diadoc/diadocapi/types/Document';
import { PendalTaskException } from 'src/lib/pendal-exception';

export default async function getDocumentByNum(
  taskService: TaskService,
  boxId: string,
  messageId: string,
  docNumber: string,
): Promise<IDocument> {
  const { diadoc } = taskService;
  const result = await diadoc.getDocumentsByMessageId(boxId, messageId);
  const document = result.Documents.find(
    (document) => document.DocumentNumber === docNumber,
  );
  if (!document)
    throw new PendalTaskException('Документ не найден', { docNumber });
  writeFileSync(
    `mon/getDocumentByNyumber.json`,
    JSON.stringify(document || {}, null, 2),
  );
  return document;
}
