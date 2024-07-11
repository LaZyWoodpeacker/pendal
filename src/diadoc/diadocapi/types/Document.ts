import { IContent } from './Content';
import { IDocflowStatus } from './DocflowStatus';
import { IDocumentType } from './DocumentType';

export interface IDocument {
  IndexKey?: string;
  MessageId: string;
  EntityId: string;
  CreationTimestampTicks: number;
  CounteragentBoxId?: string;
  DocumentType: IDocumentType;
  Content?: IContent;
  FileName?: string;
  DocumentDate?: string;
  DocumentNumber?: string;
  IsDeleted?: boolean;
  DepartmentId?: string;
  IsTest?: boolean;
  CustomDocumentId?: string;
  SendTimestampTicks?: number;
  DeliveryTimestampTicks?: number;
  PacketId?: string;
  LastModificationTimestampTicks?: number;
  IsEncryptedContent?: boolean;
  // SenderSignatureStatus?
  IsRead?: boolean;
  RoamingNotificationStatusDescription?: string;
  AttachmentVersion?: string;
  TypeNamedId: string;
  Function: string;
  WorkflowId: number;
  Title: string;
  Version: string;
  DocflowStatus: IDocflowStatus;
}
