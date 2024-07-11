import getMyReq from 'src/lib/get-my-req';
import { DiadocApiException } from './methods/DiadocApiException';
import { GetDocumentTypes } from './methods/GetDocumentTypes';

export class DiadocApiCore {
  private token: string | undefined;

  constructor(
    private diadocUserId: string,
    private diadocUser: string,
    private diadocPassword: string,
    private diadocHost = 'https://diadoc-api.kontur.ru/',
  ) {}

  private async auth(): Promise<void> {
    const response = await fetch(
      `${this.diadocHost}v3/Authenticate?type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `DiadocAuth ddauth_api_client_id=${this.diadocUserId}`,
          'X-Solution-Info': 'BITECH',
        },
        body: JSON.stringify({
          login: this.diadocUser,
          password: this.diadocPassword,
        }),
      },
    );
    if (!response.ok)
      throw await this.Error('Не смогли авторизоваться в диадоке', response);
    this.token = await response.text();
  }

  private async headers() {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `DiadocAuth ddauth_api_client_id=${
        process.env.DIADOC_USER_ID
      } ddauth_token=${await this.getToken()}`,
      'X-Solution-Info': 'BITECH',
      Accept: 'application/json',
    };
  }

  private async getToken() {
    if (!this.token) await this.auth();
    return this.token;
  }

  async request(
    method: 'GET' | 'POST',
    url: string,
    params?: { [keyof: string]: string | number } | null,
    rawBody?: object,
  ): Promise<any> {
    const urlParams =
      params && typeof params === 'object'
        ? `${url}?${Object.keys(params)
            .map((key: string) => `${key}=${params[key]}`)
            .join('&')}`
        : url;
    const body = rawBody ? JSON.stringify(rawBody) : undefined;
    const headers = await this.headers();
    const response = await fetch(`${this.diadocHost}${urlParams}`, {
      headers,
      body,
      method,
    });
    if (response.ok) {
    } else if (response.status === 401) {
      await this.auth();
      const response = await fetch(`${this.diadocHost}${urlParams}`, {
        headers,
        body,
        method,
      });
      return response;
    }
    return response;
  }

  async Error(message: string, response: Response) {
    let data;
    if (response.headers.get('content-type')?.includes('text/plain'))
      data = { text: await response.text() };
    console.log(data);
    return new DiadocApiException(
      message,
      response.status,
      response.statusText,
      data,
    );
  }
  async getDocumentTypes() {
    const org = getMyReq();
    return GetDocumentTypes(this, org.BoxId);
  }
}
