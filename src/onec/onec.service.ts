import { Injectable } from '@nestjs/common';
import { IUtData } from './types/ut.create-data';
import { generateGuid, getDom } from 'src/diadoc/helpers/xml.helpers.front';
import * as moment from 'moment';
import ourReq from './our.req';
import { DiadocService } from 'src/diadoc/diadoc.service';
import { IOnecCreateResultData } from './types/ut-create-data';
import { IDiadocMessage } from 'src/diadoc/types/message';
import { createWriteStream } from 'fs';

@Injectable()
export class OnecService {
  constructor(readonly diadoc: DiadocService) {}

  createUpdOur(
    data: IUtData,
    updNumber: string,
    sailerFnsParticipantId: string,
  ) {
    const rawData = JSON.parse(data.data);
    const [dom, file] = getDom();
    const getElement = (name: string): Element => dom.createElement(name);
    file.setAttribute('ИдФайл', generateGuid());
    file.setAttribute('ВерсФорм', '5.01');
    file.setAttribute('ВерсПрог', 'edo bitech api v0.0.1');
    const SvUchDokObor = file.appendChild(getElement('СвУчДокОбор'));
    SvUchDokObor.setAttribute('ИдОтпр', data.bayerFnsParticipantId);
    SvUchDokObor.setAttribute('ИдПол', sailerFnsParticipantId);
    const document = file.appendChild(getElement('Документ'));
    document.setAttribute('КНД', '1115131');
    document.setAttribute('Функция', 'СЧФ');
    document.setAttribute('ДатаИнфПр', moment().format('DD.MM.YYYY'));
    document.setAttribute('ВремИнфПр', moment().format('HH.mm.ss'));
    document.setAttribute('НаимЭконСубСост', ourReq.name);
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
    SvIuLUch.setAttribute('НаимОрг', rawData.seller.name);
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
    SvIuLUchPocup.setAttribute('НаимОрг', rawData.bayer.name);
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
    PodpisantFio.setAttribute('Фамилия', '');
    PodpisantFio.setAttribute('Имя', '');
    PodpisantFio.setAttribute('Отчество', '');
    return dom;
  }

  async createUpdSailerCopy(data: IDiadocMessage, updNumber) {
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
    return Buffer.from(await (await form.blob()).arrayBuffer());
  }

  async createUpdSailer(dto: IUtData): Promise<IOnecCreateResultData> {
    const updNumber = String(Math.floor(Math.random() * 10_000));
    const upd = this.createUpdOur(dto, updNumber, dto.sailerFnsParticipantId);
    const updResult = await this.diadoc.sendUpd(
      upd,
      dto.sailerBoxId,
      dto.bayerBoxId,
      'Упд от нас покупателю отправляться будет от БИАЙТЕХ',
    );
    try {
      const updCopy = await this.createUpdSailerCopy(updResult, updNumber);
      this.diadoc.CreatePdf(
        dto.bayerBoxId,
        dto.sailerBoxId,
        updCopy,
        'Копия УПД для поставщика отправляться будет от БИАЙТЕХ',
      );
    } catch (e) {
      console.log(e.message);
    }
    return {
      messageId: updResult.MessageId,
      updNumber,
      boxId: dto.sailerBoxId,
    };
  }

  async createUpdBayer(dto: IUtData): Promise<IOnecCreateResultData> {
    const updNumber = String(Math.floor(Math.random() * 10_000));
    const upd = this.createUpdOur(dto, updNumber, dto.bayerFnsParticipantId);
    const updResult = await this.diadoc.sendUpd(
      upd,
      dto.bayerBoxId,
      dto.sailerBoxId,
      'Упд от нас поставщику',
    );
    return {
      messageId: updResult.MessageId,
      updNumber,
      boxId: dto.sailerBoxId,
    };
  }
}
