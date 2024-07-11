import { DiadocApiCore } from '../api.core';
import { IOrganizationList } from '../types/OrganizationList';

export const GetDocumentTypes = async (
  api: DiadocApiCore,
  boxId: string,
): Promise<IOrganizationList> => {
  const response = await api.request('GET', '/V2/GetDocumentTypes', { boxId });
  if (!response.ok) throw await api.Error('GetDocumentTypes', response);
  return response.json();
};
