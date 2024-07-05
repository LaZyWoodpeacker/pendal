interface IBankAccount {
  bic: string;
  corNumber: string;
  number: string;
  name: string;
}

interface IProduct {
  name: string;
  quantity: number;
  price: number;
  nds: number | null;
}

export interface IBid {
  bidId: string;
  seller: {
    name: string;
    inn: string;
    kpp: string | null;
    bank: IBankAccount;
  };
  bayer: {
    name: string;
    inn: string;
    kpp: string | null;
    bank: IBankAccount | null;
  };
  lead_products: IProduct[];
}

export interface IPay {
  bidId: string;
  payDoc: string;
}
