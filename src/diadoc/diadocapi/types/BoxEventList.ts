import { IBoxEvent } from "./BoxEvent";

export interface IBoxEventList {
  Events: IBoxEvent;
  TotalCount?: number;
  TotalCountType?: "Equal" | "GreaterThanOrEqual";
}
