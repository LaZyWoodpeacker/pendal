import { DiadocApiCore } from "../api.core";
import { IOrganizationList } from "../types/OrganizationList";

export const GetMyOrganizations = async (
  api: DiadocApiCore
): Promise<IOrganizationList> => {
  const response = await api.request("GET", "GetMyOrganizations");
  if (!response.ok) throw await api.Error("GetMyOrganizations", response);
  return response.json();
};
