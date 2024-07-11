import { ICustomDataItem } from './CustomDataItem';
import { IDocumentId } from './DocumentId';
import { IMetadataItem } from './MetadataItem';
import { ISignedContent } from './SignedContent';

export interface IDocumentAttachment {
  SignedContent: ISignedContent;
  Comment?: string;
  NeedRecipientSignature?: boolean;
  InitialDocumentIds?: IDocumentId[];
  SubordinateDocumentIds?: IDocumentId[];
  CustomDocumentId?: string;
  NeedReceipt: boolean;
  CustomData?: ICustomDataItem[];
  TypeNamedId: string;
  Function?: string;
  Version?: string;
  Metadata?: IMetadataItem[];
  WorkflowId?: number;
  IsEncrypted?: boolean;
  EditingSettingId?: string;
}
