import { IEntity } from './Entity';
import { IMessageType } from './MessageType';

export interface IMessage {
  MessageId: string;
  TimestampTicks: number;
  LastPatchTimestampTicks: number;
  FromBoxId: string;
  FromTitle: string;
  ToBoxId?: string;
  ToTitle?: string;
  Entities: IEntity[];
  IsDraft?: boolean;
  DraftIsLocked?: boolean;
  DraftIsRecycled?: boolean;
  CreatedFromDraftId?: string;
  IsDeleted?: boolean;
  IsTest?: boolean;
  IsInternal?: boolean;
  IsProxified?: boolean;
  PacketIsLocked?: boolean;
  MessageType: IMessageType;
  IsReusable?: boolean;
}
