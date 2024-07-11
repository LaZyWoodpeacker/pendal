import { DiadocApiCore } from '../api.core';
import { IDocumentList } from '../types/DocumentList';

export const GetDocumentsByMessageId = async (
  api: DiadocApiCore,
  boxId: string,
  messageId: string,
): Promise<IDocumentList> => {
  const response = await api.request('GET', '/GetDocumentsByMessageId', {
    boxId,
    messageId,
  });
  if (!response.ok) {
    throw await api.Error('GetDocumentsByMessageId', response);
  }
  return response.json();
};
