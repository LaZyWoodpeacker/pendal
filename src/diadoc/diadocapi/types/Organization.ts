import { IAddress } from "./Address";
import { IBox } from "./Box";
import { SociabilityEnum } from "./Sociability";

export interface IOrganization {
  OrgIdGuid: string;
  OrgId: string;
  Inn: string;
  Kpp?: string;
  FullName: string;
  ShortName?: string;
  JoinedDiadocTreaty: boolean;
  Boxes: IBox[];
  Ogrn?: string;
  /** Зарегистрированный в ФНС идентификатор участника документооборота счетов-фактур, предусмотренный порядком обмена электронными счетами-фактурами. */
  FnsParticipantId?: string;
  FnsRegistrationDate?: string;
  Address: IAddress;
  Departments: [];
  IfnsCode?: string;
  IsPilot: boolean;
  IsActive: boolean;
  IsTest: boolean;
  IsBranch: boolean;
  IsRoaming: boolean;
  IsEmployee: boolean;
  InvitationCount: number;
  SearchCount: number;
  Sociability: SociabilityEnum;
  LiquidationDate?: string;
  CertificateOfRegistryInfo?: string;
  IsForeign: boolean;
  HasCertificateToSign: boolean;
}
