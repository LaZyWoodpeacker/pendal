import * as moment from 'moment';
import { getDom } from './xml.helpers.front';

export interface IDealData {
  lead_title: string;
  lead_total: number;
  payment: string;
  shipping: string;
  lead_date: string;
  lead_additional_info: string;
  lead_customer: {
    name: string;
    inn: string;
    city: string;
    phone: string;
    email: string;
    kpp?: string;
  };
  lead_vendor: {
    vendor_shop_name: string;
    vendor_company: string;
    vendor_url: string;
    vendor_city: string;
    vendor_phone: string;
    vendor_inn: string;
    kpp: string;
  }[];
  lead_products: {
    name: string;
    quantity: string;
    sku: string;
    price: string;
    vendor_id: number;
    id: number;
    category_id: number;
    vendor_shop_name: string;
    vendor_company: string;
    vendor_url: string;
    vendor_city: string;
    vendor_phone: string;
    vendor_inn: string;
  }[];

  utms: {
    _YM_UID: string;
  }[];
}

export const generateGuid = (): string => {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
};

/**
 * Функция генерации УПД
 * @param data
 * @returns
 */
export const genNewUpd = (src, dest, goods): XMLDocument => {
  const [dom, file] = getDom();
  const getElement = (name: string): Element => dom.createElement(name);
  file.setAttribute('ИдФайл', generateGuid());
  file.setAttribute('ВерсФорм', '5.01');
  file.setAttribute('ВерсПрог', 'edo bitech api v0.0.1');
  const SvUchDokObor = file.appendChild(getElement('СвУчДокОбор'));
  SvUchDokObor.setAttribute('ИдОтпр', generateGuid());
  SvUchDokObor.setAttribute('ИдПол', generateGuid());
  const document = file.appendChild(getElement('Документ'));
  document.setAttribute('КНД', '1115131');
  document.setAttribute('Функция', 'СЧФ');
  document.setAttribute('ДатаИнфПр', moment().format('DD.MM.YYYY'));
  document.setAttribute('ВремИнфПр', moment().format('HH.mm.ss'));
  document.setAttribute(
    'НаимЭконСубСост',
    'Общество с ограниченной ответственностью "Бизнес-Айтех"',
  );
  // Счёт-фактура
  const SvSchFakt = document.appendChild(getElement('СвСчФакт'));
  SvSchFakt.setAttribute('НомерСчФ', generateGuid());
  SvSchFakt.setAttribute('ДатаСчФ', moment().format('DD.MM.YYYY'));
  SvSchFakt.setAttribute('КодОКВ', '643');
  // Табличная часть
  const TablSchFakt = document.appendChild(getElement('ТаблСчФакт'));

  let sum = 0;
  let sumNds = 0;
  goods.forEach((good, idx) => {
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
  SvIuLUch.setAttribute('НаимОрг', src.name);
  SvIuLUch.setAttribute('ИННЮЛ', src.inn);
  SvIuLUch.setAttribute('КПП', src.kpp);
  const Adres = SvProd.appendChild(getElement('Адрес'));
  const AdrRF = Adres.appendChild(getElement('АдрРФ'));
  AdrRF.setAttribute('КодРегион', '66');
  const BankRekv = SvProd.appendChild(getElement('БанкРекв'));
  const SvBank = BankRekv.appendChild(getElement('СвБанк'));
  // Покупатель
  const SvPokup = SvSchFakt.appendChild(getElement('СвПокуп'));
  const IdSvPocup = SvPokup.appendChild(getElement('ИдСв'));
  const SvIuLUchPocup = IdSvPocup.appendChild(getElement('СвЮЛУч'));
  SvIuLUchPocup.setAttribute('НаимОрг', dest.vendor_company);
  SvIuLUchPocup.setAttribute('ИННЮЛ', dest.vendor_inn);
  SvIuLUchPocup.setAttribute('КПП', dest.vendor_kpp);
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
};
