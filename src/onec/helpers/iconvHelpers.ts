import * as iconv from 'iconv-lite';

export const encodeWinToBase64 = (utf8text: string): string => {
  const buff = iconv.encode(utf8text, 'win1251');
  return iconv.decode(buff, 'base64');
};

export const buffToBase64 = (buff: Buffer): string =>
  iconv.decode(buff, 'base64');
