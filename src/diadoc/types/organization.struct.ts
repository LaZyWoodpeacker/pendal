export interface IOrganization {
  OrgIdGuid: string;
  OrgId: string;
  Inn: string;
  Kpp: string;
  FullName: string;
  ShortName: string;
  JoinedDiadocTreaty: boolean;
  Boxes: [
    {
      BoxId: string;
      BoxIdGuid: string;
      Title: string;
      InvoiceFormatVersion: string;
      EncryptedDocumentsAllowed: boolean;
    },
  ];
  FnsParticipantId: string;
  Address: { RussianAddress: { Region: string }; AddressCode: string };
  Departments: [];
  IsPilot: boolean;
  IsActive: boolean;
  IsTest: boolean;
  IsBranch: boolean;
  IsRoaming: boolean;
  IsEmployee: boolean;
  InvitationCount: number;
  SearchCount: number;
  Sociability: string;
  IsForeign: boolean;
  HasCertificateToSign: boolean;
}
