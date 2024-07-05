import { getDom } from './xml.helpers.front';

type FormType = 'UL' | 'IP' | 'FL';
type UpdFunction = 'СЧФ' | 'СЧФДОП' | 'ДОПСвРК' | 'СвЗК';

export interface IUpdData {
  ourOrg: string;
  fileId: string;
  srcDiadocGuid: string;
  destDiadocGuid: string;
  formType: FormType;
  updFunction: UpdFunction;
  knd?: '1115131';
  date: string;
  time: string;
  number: string;
  srcOrgname: string;
  srcInn: string;
  srcKpp: string;
  destOrgname: string;
  destInn: string;
  destKpp: string;
  podpisantName: string;
  podpisantSName: string;
  podpisantFName: string;
  sfDate: string;
  goods: { name: string; col: number; cost: number; nds: number | null }[];
}

/**
 * Функция генерации УПД
 * @param data
 * @returns
 */
export const genUpd = (data: IUpdData): XMLDocument => {
  const [dom, file] = getDom();
  const getElement = (name: string): Element => dom.createElement(name);
  file.setAttribute('ИдФайл', data.fileId);
  file.setAttribute('ВерсФорм', '5.01');
  file.setAttribute('ВерсПрог', 'edo bitech api v0.0.1');
  const SvUchDokObor = file.appendChild(getElement('СвУчДокОбор'));
  SvUchDokObor.setAttribute('ИдОтпр', data.srcDiadocGuid);
  SvUchDokObor.setAttribute('ИдПол', data.destDiadocGuid);
  const document = file.appendChild(getElement('Документ'));
  document.setAttribute('КНД', data.knd || '1115131');
  document.setAttribute('Функция', data.updFunction);
  document.setAttribute('ДатаИнфПр', data.date);
  document.setAttribute('ВремИнфПр', data.time);
  document.setAttribute('НаимЭконСубСост', data.ourOrg);
  // Счёт-фактура
  const SvSchFakt = document.appendChild(getElement('СвСчФакт'));
  SvSchFakt.setAttribute('НомерСчФ', data.number);
  SvSchFakt.setAttribute('ДатаСчФ', data.sfDate);
  SvSchFakt.setAttribute('КодОКВ', '643');
  // Табличная часть
  const TablSchFakt = document.appendChild(getElement('ТаблСчФакт'));

  let sum = 0;
  let sumNds = 0;
  data.goods.forEach((good, idx) => {
    const row = TablSchFakt.appendChild(getElement('СведТов'));
    row.setAttribute('НомСтр', String(idx + 1));
    row.setAttribute('НаимТов', good.name);
    row.setAttribute('КолТов', String(good.col));
    row.setAttribute('ЦенаТов', String(good.cost));
    if (good.nds) sumNds += (good.cost / 100) * good.nds * good.col;
    sum += good.cost * good.col;
    row.setAttribute(
      'СтТовБезНДС',
      good.nds
        ? Number((good.cost - (good.cost / 100) * good.nds) * good.col).toFixed(
            2,
          )
        : Number(good.cost * good.col).toFixed(2),
    );
    row.setAttribute('ОКЕИ_Тов', '796');
    row.setAttribute('НалСт', good.nds ? `${good.nds}%` : 'без НДС');
    row.setAttribute('СтТовУчНал', Number(good.col * good.cost).toFixed(2));
    const Aktciz = row.appendChild(getElement('Акциз'));
    const BezAktciz = Aktciz.appendChild(getElement('БезАкциз'));
    BezAktciz.textContent = 'без акциза';
    const SumNal = row.appendChild(getElement('СумНал'));
    if (good.nds) {
      const SumNalInside = SumNal.appendChild(getElement('СумНал'));
      SumNalInside.textContent = Number(
        (good.cost / 100) * good.nds * good.col,
      ).toFixed(2);
    } else {
      const SumNalInside = SumNal.appendChild(getElement('БезНДС'));
      SumNalInside.textContent = 'без НДС';
    }
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
  SvIuLUch.setAttribute('НаимОрг', data.srcOrgname);
  SvIuLUch.setAttribute('ИННЮЛ', data.srcInn);
  SvIuLUch.setAttribute('КПП', data.srcKpp);
  const Adres = SvProd.appendChild(getElement('Адрес'));
  const AdrRF = Adres.appendChild(getElement('АдрРФ'));
  AdrRF.setAttribute('КодРегион', '66');
  const BankRekv = SvProd.appendChild(getElement('БанкРекв'));
  const SvBank = BankRekv.appendChild(getElement('СвБанк'));
  // Покупатель
  const SvPokup = SvSchFakt.appendChild(getElement('СвПокуп'));
  const IdSvPocup = SvPokup.appendChild(getElement('ИдСв'));
  const SvIuLUchPocup = IdSvPocup.appendChild(getElement('СвЮЛУч'));
  SvIuLUchPocup.setAttribute('НаимОрг', data.destOrgname);
  SvIuLUchPocup.setAttribute('ИННЮЛ', data.destInn);
  SvIuLUchPocup.setAttribute('КПП', data.destKpp);
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
  Podpisant.setAttribute('Статус', '1');
  Podpisant.setAttribute('ОснПолн', 'Должностные обязанности');
  const PodpisantType = Podpisant.appendChild(getElement('ЮЛ'));
  PodpisantType.setAttribute('ИННЮЛ', data.srcInn);
  PodpisantType.setAttribute('Должн', 'Директор');
  const PodpisantFio = PodpisantType.appendChild(getElement('ФИО'));
  PodpisantFio.setAttribute('Фамилия', data.podpisantSName);
  PodpisantFio.setAttribute('Имя', data.podpisantName);
  PodpisantFio.setAttribute('Отчество', data.podpisantFName);
  return dom;
};
