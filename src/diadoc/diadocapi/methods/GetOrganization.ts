import { DiadocApiCore } from '../api.core';
import { IOrganization } from '../types/Organization';
import { queryParams } from '../types/queryParams.type';

export const GetOrganization = async (
  api: DiadocApiCore,
  params: queryParams,
): Promise<IOrganization> => {
  const response = await api.request('GET', 'GetOrganization', params);
  if (!response.ok) throw await api.Error('GetOrganization', response);
  return response.json();
};
