import { HttpException, HttpStatus, Injectable, Version } from '@nestjs/common';
import { IRequestHeaders } from './types/request.headers';
import { IOrganization } from './types/organization.struct';
import { IGetMessageParams } from './types/getmessage.params';
import { readFile, writeFile } from 'fs/promises';
import * as iconv from 'iconv-lite';
import { genUpd } from './helpers/genUpd';
import { serializeXml } from './helpers/xml.helpers.front';
import { IDealData, genNewUpd } from './helpers/genNewUpd';
import { IDiadocMessage } from './types/message';
import { IOnecCreateResultData } from 'src/onec/types/ut-create-data';

@Injectable()
export class DiadocService {
  readonly diadocHost = 'https://diadoc-api.kontur.ru/';
  private token: string | undefined;
  private testOrgId = '27a5e113-9587-48b2-a771-1b5221db2106';
  private testBoxId = 'b9c5c7b0-46da-4884-a084-b8dfe9ed65ac';

  constructor() {}

  async auth(): Promise<string> {
    const response = await fetch(
      `${this.diadocHost}v3/Authenticate?type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `DiadocAuth ddauth_api_client_id=${process.env.DIADOC_USER_ID}`,
          'X-Solution-Info': 'BITECH',
        },
        body: JSON.stringify({
          login: process.env.DIADOC_USER,
          password: process.env.DIADOC_PASSWORD,
        }),
      },
    );
    if (!response.ok)
      throw new HttpException(response.statusText, response.status);
    const token = await response.text();
    return token;
  }

  getRequestHeaders(method, body, token) {
    const request: IRequestHeaders = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `DiadocAuth ddauth_api_client_id=${process.env.DIADOC_USER_ID} ddauth_token=${token}`,
        'X-Solution-Info': 'BITECH',
        Accept: 'application/json',
      },
    };
    if (!(method === 'GET' || method === 'HEAD')) {
      request.body = body;
    }
    return request;
  }

  async request(
    url: string,
    body: string | Buffer,
    token: string,
    method = 'POST',
  ): Promise<unknown> {
    const response = await fetch(
      `${this.diadocHost}${url}`,
      this.getRequestHeaders(method, body, token),
    );
    if (response.ok) {
    } else if (response.status === 401) {
      this.token = await this.auth();
      const response = await fetch(
        `${this.diadocHost}${url}`,
        this.getRequestHeaders(method, body, this.token),
      );
      if (!response.ok)
        throw new HttpException(
          `Проблемы с авторизацией в диадоке`,
          HttpStatus.FORBIDDEN,
        );
    } else {
      const text = await response.text();
      throw new HttpException(text, response.status);
    }
    const data = await response.json();
    return data;
  }

  async getCashedToken() {
    if (!this.token) this.token = await this.auth();
    return this.token;
  }

  async authJsonRequest(
    url: string,
    body: object,
    method: string,
  ): Promise<unknown> {
    const response = await this.request(
      url,
      JSON.stringify(body),
      await this.getCashedToken(),
      method,
    );
    return response;
  }

  async authGetRequest(url: string, params: object = {}): Promise<any> {
    const response = await this.request(
      url,
      null,
      await this.getCashedToken(),
      'GET',
    );
    return response;
  }

  async GetOrganization(inn: string): Promise<IOrganization | undefined> {
    return this.authGetRequest(`GetOrganization?inn=${inn}`);
  }

  async GetDocuments() {
    return this.authGetRequest(
      `V3/GetDocuments?boxId=b9c5c7b0-46da-4884-a084-b8dfe9ed65ac&filterCategory=Letter.Outbound`,
    );
  }

  async SendDto(dto: any) {
    const srcBox = await this.GetOrganization(dto.srcInn);
    const destBox = (await this.GetOrganization(dto.destInn)) as IOrganization;
    const upd = genUpd(dto);
    const buff = iconv.encode(serializeXml(upd), 'win1251');
    writeFile('upd.xml', buff);
    const result = iconv.decode(buff, 'base64');
    const response = await this.authJsonRequest(
      'V3/PostMessage',
      {
        ToBoxId: destBox.Boxes[0].BoxIdGuid,
        FromBoxId: 'b9c5c7b0-46da-4884-a084-b8dfe9ed65ac',
        // IsDraft: true,
        DelaySend: true,
        DocumentAttachments: [
          {
            TypeNamedId: 'UniversalTransferDocument',
            Function: 'СЧФ',
            Version: 'utd820_05_01_02_hyphen',
            Comment: 'Тестовый упд без отправки',
            SignedContent: {
              Content: result,
            },
          },
        ],
      },
      'POST',
    );
    console.log(response);
  }

  async GetMyEmployee() {
    return this.authGetRequest(
      `GetMyEmployee?boxid=76b4d52e-a089-40a8-8c93-8aabef1662e9`,
    );
  }

  async CreatePdf(
    FromBoxId,
    ToBoxId,
    buff,
    Comment = 'Копия СФ для поставщика',
  ) {
    // const buff = await readFile('./tmp.pdf');
    const result = iconv.decode(buff, 'base64');
    const response = await this.authJsonRequest(
      'V3/PostMessage',
      {
        ToBoxId,
        FromBoxId,
        // IsDraft: true,
        DelaySend: false,
        DocumentAttachments: [
          {
            NeedReceipt: false,
            TypeNamedId: 'Letter',
            // Function: 'default',
            Comment,
            SignedContent: {
              Content: result,
            },
            Metadata: [
              { Key: 'FileName', Value: 'doc.pdf' },
              { Key: 'DocumentNumber', Value: '12123' },
              { Key: 'DocumentDate', Value: '20.04.2023' },
            ],
          },
        ],
      },
      'POST',
    );
  }
  async getEvents() {
    return this.authGetRequest(
      `V7/GetNewEvents?boxid=b9c5c7b0-46da-4884-a084-b8dfe9ed65ac&messageType=Letter`,
    );
  }

  async getDocument() {
    return this.authGetRequest(
      `V3/GetDocument?boxid=b9c5c7b0-46da-4884-a084-b8dfe9ed65ac&messageId=2531d392-d753-49a9-97fd-9141b68c619e&entityId=b586613f-7e58-42bc-bc2c-11b271b20327&injectEntityContent=false`,
    );
  }

  async CreateDtoNewFormat(dto: IDealData) {
    const deal = {
      lead_title: 'Новый заказ #00000218',
      lead_total: 71,
      payment: 'Безналичный расчет',
      shipping: 'Бесплатная доставка продавцом',
      lead_date: '2024-06-14 09:53:28',
      lead_additional_info: '',
      lead_customer: {
        name: 'ООО МСК ТЕХНОСЕРВИС',
        inn: '6686054791',
        kpp: '668601001',
        ogrn: '1146686015530',
        city: 'Екатеринбург',
        address: 'г Екатеринбург, ул Таганская, д 17',
        phone: '79193859402',
        okved: '41.20',
        email: 'demo@demo.net',
      },
      lead_vendor: [
        {
          vendor_shop_name: 'ООО КОЛОРИТ ',
          vendor_company: 'ООО КОЛОРИТ ',
          vendor_city: 'Екатеринбург',
          vendor_phone: '+7 (343) 310-86-58',
          vendor_inn: '6664057950',
          vendor_kpp: '667901001',
          vendor_ogrn: '1026605781663',
          vendor_address: 'г Екатеринбург, ул Родонитовая, д 16',
          vendor_okved: '68.20',
        },
      ],
      lead_products: [
        {
          name: 'Мука пшеничная хлебопекарная высшего сорта, 25 кг.',
          quantity: '2.00',
          sku: '',
          price: '25.0000',
          vendor_id: 22,
          id: 69,
          category_id: 4107,
        },
        {
          name: 'Мука пшеничная хлебопекарная первого сорта, 50 кг.',
          quantity: '1.00',
          sku: '',
          price: '21.0000',
          vendor_id: 22,
          id: 73,
          category_id: 4107,
        },
      ],
    };
    // const srcBox = await this.GetOrganization(dto.srcInn);

    const src = deal.lead_customer;
    src.kpp = '668501001';
    const dest = deal.lead_vendor[0];
    const goods = deal.lead_products;
    const destBox = (await this.GetOrganization(
      dest.vendor_inn,
    )) as IOrganization;
    dest.vendor_kpp = destBox.Kpp;
    const upd = genNewUpd(src, dest, goods);
    const buff = iconv.encode(serializeXml(upd), 'win1251');
    writeFile('upd.xml', buff);
    const result = iconv.decode(buff, 'base64');
    const response = await this.authJsonRequest(
      'V3/PostMessage',
      {
        ToBoxId: destBox.Boxes[0].BoxIdGuid,
        FromBoxId: 'b9c5c7b0-46da-4884-a084-b8dfe9ed65ac',
        // IsDraft: true,
        DelaySend: true,
        DocumentAttachments: [
          {
            TypeNamedId: 'UniversalTransferDocument',
            Function: 'СЧФ',
            Version: 'utd820_05_01_02_hyphen',
            Comment: 'Тестовый упд без отправки',
            SignedContent: {
              Content: result,
            },
          },
        ],
      },
      'POST',
    );
    console.log(response);
    return result;
  }

  // Normal methods

  async orgByInnKpp(inn, kpp?) {
    const response = (await this.authGetRequest(
      `/GetOrganization?&inn=${inn}&kpp=${kpp}`,
    )) as IOrganization;
    return response;
  }

  async GetCounteragents(inn) {
    return this.authGetRequest(
      `/V2/GetCounteragents?myOrgId=${this.testOrgId}&query=${inn}`,
    );
  }

  async GetMyCertificates() {
    return this.authGetRequest(`/GetMyCertificates?boxId=${this.testBoxId}`);
  }

  async AcquireCounteragent(inn) {
    const response = await this.authJsonRequest(
      `/V2/AcquireCounteragent?myOrgId=${this.testOrgId}`,
      {
        Inn: inn,
        MessageToCounteragent: 'Приглашение от БИАЙТЕХ',
      },
      'POST',
    );
    return response;
  }

  async sendUpd(
    upd,
    FromBoxId,
    ToBoxId,
    Comment = 'Тестовый упд без отправки',
  ): Promise<IDiadocMessage> {
    const buff = iconv.encode(serializeXml(upd), 'win1251');
    writeFile('upd.xml', buff);
    const result = iconv.decode(buff, 'base64');
    const response = await this.authJsonRequest(
      'V3/PostMessage',
      {
        ToBoxId,
        FromBoxId,
        // IsDraft: true,
        DelaySend: false,
        DocumentAttachments: [
          {
            NeedReceipt: true,
            TypeNamedId: 'UniversalTransferDocument',
            Function: 'СЧФ',
            Version: 'utd820_05_01_02_hyphen',
            Comment,
            SignedContent: {
              Content: result,
            },
          },
        ],
      },
      'POST',
    );
    return response as IDiadocMessage;
  }

  async getDocState(data: IOnecCreateResultData): Promise<any> {
    return this.authGetRequest(
      `/V5/GetMessage?boxId=${data.boxId}&messageId=${data.messageId}`,
    );
  }

  async generatePrintForm(boxId, messageId, documentId) {
    const url = `/GeneratePrintForm?boxId=${boxId}&messageId=${messageId}&documentId=${documentId}`;
    const method = 'GET';
    const token = this.getCashedToken();
    const body = JSON.stringify({});
    let response = null;
    const fetchThis = async (): Promise<any> => {
      let response = await fetch(
        `${this.diadocHost}${url}`,
        this.getRequestHeaders(method, body, token),
      );
      if (response.ok) {
        return response;
      } else if (response.status === 401) {
        this.token = await this.auth();
        response = await fetch(
          `${this.diadocHost}${url}`,
          this.getRequestHeaders(method, body, this.token),
        );
        if (!response.ok)
          throw new HttpException(
            `Проблемы с авторизацией в диадоке`,
            HttpStatus.FORBIDDEN,
          );
      } else {
        return response;
        const text = await response.text();
        throw new HttpException(text, response.status);
      }
      return response;
    };
    let retryafter = null;
    do {
      response = await fetchThis();
      retryafter = response.headers.get('retry-after');
      if (retryafter) {
        await new Promise((res) => {
          setTimeout(() => res('ready'), retryafter * 1000);
        });
      }
      console.log(retryafter);
    } while (retryafter);
    return response;
  }
}
