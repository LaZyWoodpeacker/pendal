import { Injectable } from '@nestjs/common';
import { DiadocApiCore } from './diadocapi';
import { GetOrganization } from './diadocapi/methods/GetOrganization';
import { GeneratePrintForm } from './diadocapi/methods/GeneratePrintForm';
import { GetDocumentsByMessageId } from './diadocapi/methods/GetDocumentsByMessageId';
import { IDocumentList } from './diadocapi/types/DocumentList';
import { PostMessage } from './diadocapi/methods/PostMessage';
import { IMessageToPost } from './diadocapi/types/MessageToPost';
import { IDocumentAttachment } from './diadocapi/types/DocumentAttachment';

@Injectable()
export class DiadocService extends DiadocApiCore {
  constructor() {
    if (
      !(
        process.env.DIADOC_USER_ID &&
        process.env.DIADOC_USER &&
        process.env.DIADOC_PASSWORD
      )
    )
      throw new Error('Нет реквизитов для авторизации в диадок');
    super(
      process.env.DIADOC_USER_ID,
      process.env.DIADOC_USER,
      process.env.DIADOC_PASSWORD,
    );
  }

  async getOrganization(inn: string) {
    return GetOrganization(this, { inn });
  }

  async generatePrintForm(
    boxId: string,
    messageId: string,
    documentId: string,
  ) {
    const blob = await GeneratePrintForm(this, boxId, messageId, documentId);
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getDocumentsByMessageId(
    boxId: string,
    messageId: string,
  ): Promise<IDocumentList> {
    return GetDocumentsByMessageId(this, boxId, messageId);
  }

  async sendDocs(
    FromBoxId: string,
    ToBoxId: string,
    DocumentAttachments: IDocumentAttachment[],
  ) {
    const message: IMessageToPost = {
      ToBoxId,
      FromBoxId,
      DelaySend: false,
      DocumentAttachments,
    };
    const result = await PostMessage(this, null, message);
    return result;
  }
}
