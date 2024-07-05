export interface IDocflowStatus {
  PrimaryStatus: {
    Severity: string;
    StatusText: string;
  };
}

export interface IDiadocDocumentInfo {
  MessageId: string;
  EntityId: string;
  CreationTimestampTicks: number;
  CounteragentBoxId: string;
  DocumentType: string;
  FileName: string;
  DocumentDate: string;
  DocumentNumber: string;
  IsDeleted: boolean;
  IsTest: boolean;
  RevocationStatus: string;
  SenderSignatureStatus: string;
  IsRead: boolean;
  PacketIsLocked: boolean;
  TypeNamedId: string;
  Function: string;
  WorkflowId: number;
  Title: string;
  RecipientReceiptMetadata: {
    ReceiptStatus: string;
    ConfirmationMetadata: {
      ReceiptStatus: string;
      DateTimeTicks: 0;
    };
  };
  ConfirmationMetadata: {
    ReceiptStatus: string;
    DateTimeTicks: 0;
  };
  Version: string;
  DocflowStatus: IDocflowStatus;
  MessageIdGuid: string;
  EntityIdGuid: string;
  CreationTimestamp: string;
}
