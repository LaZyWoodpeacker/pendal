import { DiadocApiCore } from "../api.core";
import { IBoxEventList } from "../types/BoxEventList";
import { queryParams } from "../types/queryParams.type";

export const GetNewEvents = async (
  api: DiadocApiCore,
  params: queryParams
): Promise<IBoxEventList> => {
  const response = await api.request("GET", "/V7/GetNewEvents", params);
  if (!response.ok) {
    throw await api.Error("GetNewEvents", response);
  }
  return response.json();
};
