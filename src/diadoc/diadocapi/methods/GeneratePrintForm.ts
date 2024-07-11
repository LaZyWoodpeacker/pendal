import { DiadocApiCore } from '../api.core';

export const GeneratePrintForm = async (
  api: DiadocApiCore,
  boxId: string,
  messageId: string,
  documentId: string,
): Promise<any> => {
  let response;
  let retryAfter = null;
  do {
    response = await api.request('GET', 'GeneratePrintForm', {
      boxId,
      messageId,
      documentId,
    });
    if (!response.ok) throw await api.Error('GeneratePrintForm', response);
    retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      await new Promise((res) => {
        setTimeout(() => res('ready'), retryAfter * 1000);
      });
    }
  } while (retryAfter);
  return response.blob();
};
