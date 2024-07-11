import { IOrganization } from "./Organization";
import { OrganizationInvoiceFormatVersionEnum } from "./OrganizationInvoiceFormatVersion";

export interface IBox {
  BoxId: string;
  Title: string;
  Organization?: IOrganization;
  InvoiceFormatVersion?: OrganizationInvoiceFormatVersionEnum;
  EncryptedDocumentsAllowed?: boolean;
  BoxIdGuid: string;
}
