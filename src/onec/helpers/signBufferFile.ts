import { signByOpenSsl } from 'src/lib/signByOpenSsl';
import { buffToBase64 } from './iconvHelpers';

export const signStringToBase64 = async (
  data: string | Buffer,
): Promise<[string, string]> => {
  const buff = data instanceof Buffer ? data : Buffer.from(data);
  const signature = await signByOpenSsl(
    buff,
    process.env.SUBSCRIBER_CER,
    process.env.SUBSCRIBER_KEY,
  );
  return [buffToBase64(buff), buffToBase64(signature)];
};
