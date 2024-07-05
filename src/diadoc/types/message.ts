import { AttachmentType } from './attachment-types';
import { IDiadocDocumentInfo, IDocflowStatus } from './document-info';
import { EntityType } from './entity-type';

export enum LockMode {
  None = 1,
  Send = 2,
  Full = 3,
}

export enum MessageType {
  Unknown = 0,
  Letter = 1,
  Draft = 2,
  Template = 3,
}

export interface IDiadocMessage {
  MessageId: string;
  TimestampTicks: number;
  LastPatchTimestampTicks: number;
  FromBoxId: string;
  FromTitle: string;
  ToBoxId: string;
  ToTitle: string;
  Entities: [
    {
      EntityType: EntityType;
      EntityId: string;
      AuthorUserId: string;
      ParentEntityId: string;
      Content: object[];
      AttachmentType: AttachmentType;
      FileName: string;
      NeedRecipientSignature: boolean;
      DocumentInfo: IDiadocDocumentInfo;
      RawCreationDate: number;
      NeedReceipt: boolean;
      IsApprovementSignature: boolean;
      IsEncryptedContent: boolean;
      Labels: object[];
      Version: string;
      ContentTypeId: string;
      DocflowStatus: IDocflowStatus;
    },
  ];
  IsDraft: boolean;
  DraftIsLocked: boolean;
  DraftIsRecycled: boolean;
  CreatedFromDraftId: string;
  DraftIsTransformedToMessageIdList: object[];
  IsDeleted: boolean;
  IsTest: boolean;
  IsInternal: boolean;
  IsProxified: boolean;
  ProxyBoxId: string;
  ProxyTitle: string;
  PacketIsLocked: boolean;
  LockMode: LockMode;
  MessageType: MessageType;
  IsReusable: boolean;
}
