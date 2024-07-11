import { DiadocApiCore } from '../api.core';
import { IMessage } from '../types/Message';
import { IMessageToPost } from '../types/MessageToPost';
import { IOrganization } from '../types/Organization';
import { queryParams } from '../types/queryParams.type';
import { v4 as uuidv4 } from 'uuid';

export const PostMessage = async (
  api: DiadocApiCore,
  _params: queryParams,
  data: IMessageToPost,
): Promise<IMessage> => {
  const operationId = uuidv4();
  let response;
  let retryAfter = null;
  do {
    response = await api.request(
      'POST',
      'V3/PostMessage',
      { operationId },
      data,
    );
    if (!response.ok) throw await api.Error('PostMessage', response);
    retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      await new Promise((res) => {
        setTimeout(() => res('ready'), retryAfter * 1000);
      });
    }
  } while (retryAfter);
  return response.json();
};
