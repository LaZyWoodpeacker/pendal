import { DiadocApiCore } from "../api.core";
import { IDocumentList } from "../types/DocumentList";
import { queryParams } from "../types/queryParams.type";

export const GetDocuments = async (
  api: DiadocApiCore,
  params: queryParams
): Promise<IDocumentList> => {
  const response = await api.request("GET", "/V3/GetDocuments", params);
  if (!response.ok) {
    throw await api.Error("GetDocuments", response);
  }
  return response.json();
};
