import { IDocument } from './Document';

export interface IDocumentList {
  TotalCount: number;
  Documents: IDocument[];
  HasMoreResults: boolean;
}
