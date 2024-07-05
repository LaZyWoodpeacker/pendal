export interface IRequestHeaders {
  method: 'POST' | 'GET';
  headers: {
    'Content-Type': 'application/json; charset=utf-8';
    Authorization: string;
    'X-Solution-Info': 'BITECH';
    Accept?: 'application/json';
  };
  body?: string;
}
