import { IContent } from './Content';
import { IDocument } from './Document';

export interface IEntity {
  EntityType?: 'UnknownEntityType' | 'Attachment' | 'Signature';
  EntityId: string;
  ParentEntityId?: string;
  Content?: IContent;
  AttachmentType?: string;
  FileName?: string;
  NeedRecipientSignature?: boolean;
  SignerBoxId?: string;
  NotDeliveredEventId?: string;
  DocumentInfo: IDocument;
  RawCreationDate?: number;
  SignerDepartmentId?: string;
  NeedReceipt?: boolean;
  PacketId?: string;
  IsApprovementSignature?: boolean;
  IsEncryptedContent?: boolean;
  AttachmentVersion?: string;
  Version?: string;
  ContentTypeId?: string;
  AuthorUserId?: string;
}
