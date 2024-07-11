import { IMessage } from "./Message";
import { IMessagePatch } from "./MessagePatch";

export interface IBoxEvent {
  EventId: string;
  Message?: IMessage;
  Patch?: IMessagePatch;
  IndexKey?: string;
}
