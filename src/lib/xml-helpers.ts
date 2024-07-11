import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export const getDom = (encoding = 'windows-1251'): [XMLDocument, Element] => {
  const domParser = new DOMParser();

  const dom = domParser.parseFromString(
    `<?xml version="1.0" encoding="${encoding}"?>\n<Файл />\n`,
    'text/xml',
  );
  const file = dom.getElementsByTagName('Файл').item(0);
  if (!file) throw new Error('Нет корневого элемента');
  return [dom, file];
};

export const serializeXml = (dom: XMLDocument): string => {
  return new XMLSerializer().serializeToString(dom);
};

export const generateGuid = () => {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
};
