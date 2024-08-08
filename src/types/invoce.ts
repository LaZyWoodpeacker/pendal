interface IBankAccount {
  bic: string;
  corNumber: string;
  number: string;
  name: string;
}

interface IProduct {
  name: string;
  quantity: string;
  price: string;
  nds: string | null;
  aks: string | null;
}

export interface IBid {
  bidId: string;
  payment: string;
  shipping: string;
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
