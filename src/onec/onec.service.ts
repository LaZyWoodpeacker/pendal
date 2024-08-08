import { Injectable } from '@nestjs/common';
import { IUtData } from './types/ut.create-data';
import { generateGuid, getDom, serializeXml } from 'src/lib/xml-helpers';
import * as moment from 'moment';
import { DiadocService } from 'src/diadoc/diadoc.service';
import {
  IOnecCreateResultData,
  IOnecCreateResultReportData,
} from './types/ut-create-data';
import { readFile, writeFile } from 'fs/promises';
import getMyReq, { IOurReq } from 'src/lib/get-my-req';
import {
  encodeWinToBase64,
  buffToBase64,
  encodeUtfToWin,
} from './helpers/iconvHelpers';
import { IMessage } from 'src/diadoc/diadocapi/types/Message';
import { Bid } from 'src/bid/entities/bid.entity';
import { signByOpenSsl } from 'src/lib/signByOpenSsl';
import { signStringToBase64 } from './helpers/signBufferFile';

@Injectable()
export class OnecService {
  ourReq: IOurReq;
  constructor(readonly diadoc: DiadocService) {
    this.ourReq = getMyReq();
  }

  createUpdOur(data: Bid, updNumber: string) {
    const rawData = JSON.parse(data.data);
    const [dom, file] = getDom();
    const getElement = (name: string): Element => dom.createElement(name);
    file.setAttribute(
      'ИдФайл',
      `ON_NSCHFDOPPR_${data.sailerFnsParticipantId}_${this.ourReq.FnsParticipantId}_${moment().format('YYYYMMDD')}_${generateGuid()}`,
    );
    file.setAttribute('ВерсФорм', '5.01');
    file.setAttribute('ВерсПрог', 'edo bitech api v0.0.1');
    const SvUchDokObor = file.appendChild(getElement('СвУчДокОбор'));
    SvUchDokObor.setAttribute('ИдОтпр', this.ourReq.FnsParticipantId);
    SvUchDokObor.setAttribute('ИдПол', data.sailerFnsParticipantId);
    const SvOEDOtpr = SvUchDokObor.appendChild(getElement('СвОЭДОтпр'));
    SvOEDOtpr.setAttribute('НаимОрг', 'АО "ПФ "СКБ Контур"');
    SvOEDOtpr.setAttribute('ИННЮЛ', '6663003127');
    SvOEDOtpr.setAttribute('ИдЭДО', '2BM');

    const document = file.appendChild(getElement('Документ'));
    document.setAttribute('КНД', '1115131');
    document.setAttribute('Функция', 'СЧФ');
    document.setAttribute('ДатаИнфПр', moment().format('DD.MM.YYYY'));
    document.setAttribute('ВремИнфПр', moment().format('HH.mm.ss'));
    document.setAttribute('НаимЭконСубСост', this.ourReq.name);
    // Счёт-фактура
    const SvSchFakt = document.appendChild(getElement('СвСчФакт'));
    SvSchFakt.setAttribute('НомерСчФ', updNumber);
    SvSchFakt.setAttribute('ДатаСчФ', moment().format('DD.MM.YYYY'));
    SvSchFakt.setAttribute('КодОКВ', '643');
    // Табличная часть
    const TablSchFakt = document.appendChild(getElement('ТаблСчФакт'));

    let sum = 0;
    let sumNds = 0;
    rawData.lead_products.forEach((good, idx) => {
      const row = TablSchFakt.appendChild(getElement('СведТов'));
      row.setAttribute('НомСтр', String(idx + 1));
      row.setAttribute('НаимТов', good.name);
      row.setAttribute('КолТов', String(good.quantity));
      row.setAttribute('ЦенаТов', String(good.price));
      row.setAttribute(
        'СтТовБезНДС',
        Number(parseFloat(good.price) * parseFloat(good.quantity)).toFixed(2),
      );
      sum += parseFloat(good.price) * parseFloat(good.quantity);
      row.setAttribute('ОКЕИ_Тов', '796');
      row.setAttribute('НалСт', 'без НДС');
      row.setAttribute(
        'СтТовУчНал',
        Number(parseFloat(good.price) * parseFloat(good.quantity)).toFixed(2),
      );

      const Aktciz = row.appendChild(getElement('Акциз'));
      const BezAktciz = Aktciz.appendChild(getElement('БезАкциз'));
      BezAktciz.textContent = 'без акциза';

      const SumNal = row.appendChild(getElement('СумНал'));
      const SumNalInside = SumNal.appendChild(getElement('БезНДС'));
      SumNalInside.textContent = 'без НДС';

      const DopSvedTov = row.appendChild(getElement('ДопСведТов'));
      DopSvedTov.setAttribute('НаимЕдИзм', 'шт');
    });

    const VsegoOpl = TablSchFakt.appendChild(getElement('ВсегоОпл'));
    VsegoOpl.setAttribute('СтТовУчНалВсего', sum.toFixed(2));
    const SumNalVsego = VsegoOpl.appendChild(getElement('СумНалВсего'));
    const SumNal = SumNalVsego.appendChild(getElement('СумНал'));
    SumNal.textContent = sumNds.toFixed(2);
    // Продавец
    const SvProd = SvSchFakt.appendChild(getElement('СвПрод'));
    const IdSv = SvProd.appendChild(getElement('ИдСв'));
    const SvIuLUch = IdSv.appendChild(getElement('СвЮЛУч'));
    SvIuLUch.setAttribute(
      'НаимОрг',
      `${rawData.seller.name}(${data.sailerName})`,
    );
    SvIuLUch.setAttribute('ИННЮЛ', data.sailerInn);
    SvIuLUch.setAttribute('КПП', data.sailerKpp);
    const Adres = SvProd.appendChild(getElement('Адрес'));
    const AdrRF = Adres.appendChild(getElement('АдрРФ'));
    AdrRF.setAttribute('КодРегион', '66');
    const BankRekv = SvProd.appendChild(getElement('БанкРекв'));
    const SvBank = BankRekv.appendChild(getElement('СвБанк'));
    // Платёжный документ
    const SvPRD = SvSchFakt.appendChild(getElement('СвПРД'));
    SvPRD.setAttribute('НомерПРД', data.payDocNumber);
    SvPRD.setAttribute('ДатаПРД', moment().format('DD.MM.YYYY'));
    // Покупатель
    const SvPokup = SvSchFakt.appendChild(getElement('СвПокуп'));
    const IdSvPocup = SvPokup.appendChild(getElement('ИдСв'));
    const SvIuLUchPocup = IdSvPocup.appendChild(getElement('СвЮЛУч'));
    SvIuLUchPocup.setAttribute(
      'НаимОрг',
      `${rawData.bayer.name}(${data.bayerName})`,
    );
    SvIuLUchPocup.setAttribute('ИННЮЛ', data.bayerInn);
    SvIuLUchPocup.setAttribute('КПП', data.bayerKpp);
    const AdresPocup = SvPokup.appendChild(getElement('Адрес'));
    const AdrRFPocup = AdresPocup.appendChild(getElement('АдрРФ'));
    AdrRFPocup.setAttribute('КодРегион', '66');
    const BankRekvPocup = SvPokup.appendChild(getElement('БанкРекв'));
    const SvBankPocup = BankRekvPocup.appendChild(getElement('СвБанк'));
    // ДопСв
    const DopSvFKhZh1 = SvSchFakt.appendChild(getElement('ДопСвФХЖ1'));
    DopSvFKhZh1.setAttribute('НаимОКВ', 'Российский рубль');
    DopSvFKhZh1.setAttribute('ОбстФормСЧФ', '1');
    // Подписант
    const Podpisant = document.appendChild(getElement('Подписант'));
    Podpisant.setAttribute('ОблПолн', '1');
    Podpisant.setAttribute('Статус', '2');
    Podpisant.setAttribute('ОснПолн', 'Должностные обязанности');
    const PodpisantType = Podpisant.appendChild(getElement('ЮЛ'));
    PodpisantType.setAttribute('ИННЮЛ', '6685215502');
    PodpisantType.setAttribute('Должн', 'Директор');
    const PodpisantFio = PodpisantType.appendChild(getElement('ФИО'));
    PodpisantFio.setAttribute('Фамилия', 'Тестовый');
    PodpisantFio.setAttribute('Имя', 'Подписант');
    PodpisantFio.setAttribute('Отчество', 'Биайтех');
    return dom;
  }

  createUpdOurForSailer(data: Bid, updNumber: string) {
    const rawData = JSON.parse(data.data);
    const [dom, file] = getDom();
    const getElement = (name: string): Element => dom.createElement(name);
    file.setAttribute(
      'ИдФайл',
      `ON_NSCHFDOPPR_${data.sailerFnsParticipantId}_${this.ourReq.FnsParticipantId}_${moment().format('YYYYMMDD')}_${generateGuid()}`,
    );
    file.setAttribute('ВерсФорм', '5.01');
    file.setAttribute('ВерсПрог', 'edo bitech api v0.0.1');
    const SvUchDokObor = file.appendChild(getElement('СвУчДокОбор'));
    SvUchDokObor.setAttribute('ИдОтпр', this.ourReq.FnsParticipantId);
    SvUchDokObor.setAttribute('ИдПол', data.sailerFnsParticipantId);
    const SvOEDOtpr = SvUchDokObor.appendChild(getElement('СвОЭДОтпр'));
    SvOEDOtpr.setAttribute('НаимОрг', 'АО "ПФ "СКБ Контур"');
    SvOEDOtpr.setAttribute('ИННЮЛ', '6663003127');
    SvOEDOtpr.setAttribute('ИдЭДО', '2BM');

    const document = file.appendChild(getElement('Документ'));
    document.setAttribute('КНД', '1115131');
    document.setAttribute('Функция', 'СЧФ');
    document.setAttribute('ДатаИнфПр', moment().format('DD.MM.YYYY'));
    document.setAttribute('ВремИнфПр', moment().format('HH.mm.ss'));
    document.setAttribute('НаимЭконСубСост', this.ourReq.name);
    // Счёт-фактура
    const SvSchFakt = document.appendChild(getElement('СвСчФакт'));
    SvSchFakt.setAttribute('НомерСчФ', updNumber);
    SvSchFakt.setAttribute('ДатаСчФ', moment().format('DD.MM.YYYY'));
    SvSchFakt.setAttribute('КодОКВ', '643');
    // Табличная часть
    const TablSchFakt = document.appendChild(getElement('ТаблСчФакт'));

    const cost = 100;
    const row = TablSchFakt.appendChild(getElement('СведТов'));
    row.setAttribute('НомСтр', String(1));
    row.setAttribute('НаимТов', 'Услуги БИАЙТЕХ');
    row.setAttribute('КолТов', String(1));
    row.setAttribute('ЦенаТов', String(cost));
    row.setAttribute('СтТовБезНДС', Number(cost * 0.8).toFixed(2));
    row.setAttribute('ОКЕИ_Тов', '796');
    row.setAttribute('НалСт', '20%');
    row.setAttribute('СтТовУчНал', Number(cost).toFixed(2));

    const Aktciz = row.appendChild(getElement('Акциз'));
    const BezAktciz = Aktciz.appendChild(getElement('БезАкциз'));
    BezAktciz.textContent = 'без акциза';

    const SumNalLine = row.appendChild(getElement('СумНал'));
    const SumNalInside = SumNalLine.appendChild(getElement('СумНал'));
    SumNalInside.textContent = (cost * 0.2).toFixed(2);

    const DopSvedTov = row.appendChild(getElement('ДопСведТов'));
    DopSvedTov.setAttribute('НаимЕдИзм', 'шт');

    const VsegoOpl = TablSchFakt.appendChild(getElement('ВсегоОпл'));
    VsegoOpl.setAttribute('СтТовУчНалВсего', cost.toFixed(2));
    const SumNalVsego = VsegoOpl.appendChild(getElement('СумНалВсего'));
    const SumNal = SumNalVsego.appendChild(getElement('СумНал'));
    SumNal.textContent = (cost * 0.2).toFixed(2);
    // Продавец
    const SvProd = SvSchFakt.appendChild(getElement('СвПрод'));
    const IdSv = SvProd.appendChild(getElement('ИдСв'));
    const SvIuLUch = IdSv.appendChild(getElement('СвЮЛУч'));
    SvIuLUch.setAttribute('НаимОрг', this.ourReq.name);
    SvIuLUch.setAttribute('ИННЮЛ', this.ourReq.bayerInn);
    SvIuLUch.setAttribute('КПП', this.ourReq.bayerKpp);
    const Adres = SvProd.appendChild(getElement('Адрес'));
    const AdrRF = Adres.appendChild(getElement('АдрРФ'));
    AdrRF.setAttribute('КодРегион', '66');
    const BankRekv = SvProd.appendChild(getElement('БанкРекв'));
    const SvBank = BankRekv.appendChild(getElement('СвБанк'));
    // Платёжный документ
    const SvPRD = SvSchFakt.appendChild(getElement('СвПРД'));
    SvPRD.setAttribute('НомерПРД', '1');
    SvPRD.setAttribute('ДатаПРД', moment().format('DD.MM.YYYY'));
    // Покупатель
    const SvPokup = SvSchFakt.appendChild(getElement('СвПокуп'));
    const IdSvPocup = SvPokup.appendChild(getElement('ИдСв'));
    const SvIuLUchPocup = IdSvPocup.appendChild(getElement('СвЮЛУч'));
    SvIuLUchPocup.setAttribute(
      'НаимОрг',
      `${rawData.seller.name}(${data.sailerName})`,
    );
    SvIuLUchPocup.setAttribute('ИННЮЛ', data.sailerInn);
    SvIuLUchPocup.setAttribute('КПП', data.sailerKpp);
    const AdresPocup = SvPokup.appendChild(getElement('Адрес'));
    const AdrRFPocup = AdresPocup.appendChild(getElement('АдрРФ'));
    AdrRFPocup.setAttribute('КодРегион', '66');
    const BankRekvPocup = SvPokup.appendChild(getElement('БанкРекв'));
    const SvBankPocup = BankRekvPocup.appendChild(getElement('СвБанк'));
    // ДопСв
    const DopSvFKhZh1 = SvSchFakt.appendChild(getElement('ДопСвФХЖ1'));
    DopSvFKhZh1.setAttribute('НаимОКВ', 'Российский рубль');
    DopSvFKhZh1.setAttribute('ОбстФормСЧФ', '1');
    // Подписант
    const Podpisant = document.appendChild(getElement('Подписант'));
    Podpisant.setAttribute('ОблПолн', '1');
    Podpisant.setAttribute('Статус', '2');
    Podpisant.setAttribute('ОснПолн', 'Должностные обязанности');
    const PodpisantType = Podpisant.appendChild(getElement('ЮЛ'));
    PodpisantType.setAttribute('ИННЮЛ', '6685215502');
    PodpisantType.setAttribute('Должн', 'Директор');
    const PodpisantFio = PodpisantType.appendChild(getElement('ФИО'));
    PodpisantFio.setAttribute('Фамилия', 'Тестовый');
    PodpisantFio.setAttribute('Имя', 'Подписант');
    PodpisantFio.setAttribute('Отчество', 'Биайтех');
    return dom;
  }

  async createUpdSailerCopy(data: IMessage, updNumber: string) {
    const document = data.Entities.find((doc) => {
      return (
        doc.DocumentInfo?.DocumentType === 'UniversalTransferDocument' &&
        doc.DocumentInfo.DocumentNumber === updNumber
      );
    });
    const form = await this.diadoc.generatePrintForm(
      data.FromBoxId,
      data.MessageId,
      document.EntityId,
    );
    return form;
  }

  async createUpdSailer(dto: Bid): Promise<IOnecCreateResultData> {
    const updNumber = String(Math.floor(Math.random() * 10_000));
    const upd = this.createUpdOur(dto, updNumber);
    const [updBase64, signatureBase64] = await signStringToBase64(
      encodeUtfToWin(serializeXml(upd)),
    );
    const updResult = await this.diadoc.sendDocs(
      this.ourReq.BoxId,
      dto.bayerBoxId,
      [
        {
          NeedReceipt: true,
          NeedRecipientSignature: true,
          TypeNamedId: 'UniversalTransferDocument',
          Function: 'СЧФ',
          Version: 'utd820_05_01_02_hyphen',
          Comment: 'УПД для покупателя отправляться будет от БИАЙТЕХ',
          SignedContent: {
            Content: updBase64,
            // SignWithTestSignature: true,
            Signature: signatureBase64,
          },
        },
      ],
    );
    const updCopy = await this.createUpdSailerCopy(updResult, updNumber);
    const updCopyBase64 = buffToBase64(updCopy);
    const updCopyResult = await this.diadoc.sendDocs(
      this.ourReq.BoxId,
      dto.sailerBoxId,
      [
        {
          NeedReceipt: false,
          NeedRecipientSignature: false,
          TypeNamedId: 'Nonformalized',
          Comment: 'Копия УПД для поставщика отправляться будет от БИАЙТЕХ',
          SignedContent: {
            Content: updCopyBase64,
            SignWithTestSignature: true,
          },
          Metadata: [
            { Key: 'FileName', Value: 'Копия_Упд.pdf' },
            { Key: 'DocumentNumber', Value: '12123' },
            { Key: 'DocumentDate', Value: '20.04.2023' },
          ],
        },
      ],
    );

    return {
      messageId: updResult.MessageId,
      copyMessageId: updCopyResult.MessageId,
      updNumber,
      boxId: updResult.FromBoxId,
    };
  }

  async createUpdBayer(dto: Bid): Promise<IOnecCreateResultReportData> {
    const updNumber = String(Math.floor(Math.random() * 10_000));
    const reportNumber = String(Math.floor(Math.random() * 10_000));
    const upd = this.createUpdOurForSailer(dto, updNumber);
    const buff = await readFile('./Report.pdf');
    const [updBase64, signatureBase64] = await signStringToBase64(
      encodeUtfToWin(serializeXml(upd)),
    );
    const [reportBase64, reportSignatureBase64] =
      await signStringToBase64(buff);

    const docsResult = await this.diadoc.sendDocs(
      this.ourReq.BoxId,
      dto.sailerBoxId,
      [
        {
          NeedReceipt: true,
          NeedRecipientSignature: true,
          TypeNamedId: 'UniversalTransferDocument',
          Function: 'СЧФ',
          Version: 'utd820_05_01_02_hyphen',
          Comment: 'УПД для покупателя отправляться будет от БИАЙТЕХ',
          SignedContent: {
            Content: updBase64,
            Signature: signatureBase64,
            // SignWithTestSignature: true,
          },
        },
        {
          NeedReceipt: true,
          NeedRecipientSignature: true,
          TypeNamedId: 'Nonformalized',
          Comment: 'Отчёт агента для поставщика отправляться будет от БИАЙТЕХ',
          SignedContent: {
            Content: reportBase64,
            Signature: reportSignatureBase64,
            // SignWithTestSignature: true,
          },
          Metadata: [
            { Key: 'FileName', Value: 'Отчёт агента.pdf' },
            { Key: 'DocumentNumber', Value: reportNumber },
            { Key: 'DocumentDate', Value: '20.04.2023' },
          ],
        },
      ],
    );
    return {
      messageId: docsResult.MessageId,
      updNumber,
      reportNumber,
      boxId: docsResult.FromBoxId,
    };
  }
}
