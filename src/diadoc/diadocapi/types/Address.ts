import { IForeignAddress } from "./ForeignAddress";
import { IRussianAddress } from "./RussianAddress";

export interface IAddress {
  RussianAddress?: IRussianAddress;
  ForeignAddress?: IForeignAddress;
  AddressCode?: string;
}
