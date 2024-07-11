import { IDocumentAttachment } from './DocumentAttachment';

export interface IMessageToPost {
  FromBoxId: string;
  ToBoxId?: string;
  ToDepartmentId?: string;
  IsDraft?: boolean;
  LockDraft?: boolean;
  StrictDraftValidation?: boolean;
  IsInternal?: boolean;
  DelaySend?: boolean;
  DocumentAttachments: IDocumentAttachment[];
}
