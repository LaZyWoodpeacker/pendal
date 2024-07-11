import { DiadocApiCore } from "../api.core";
import { IBox } from "../types/Box";

export const GetBox = async (
  api: DiadocApiCore,
  boxId: string
): Promise<IBox> => {
  if (!boxId) throw Error("Не указан ящик");
  const response = await api.request("GET", "GetBox", { boxId });
  if (!response.ok) {
    throw await api.Error("GetBox", response);
  }
  return response.json();
};
