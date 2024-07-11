export interface IOurReq {
  name: string;
  BoxId: string;
  OrgIdGuid: string;
  FnsParticipantId: string;
  bayerInn: string;
  bayerKpp: string;
}

export default function getMyReq(): IOurReq {
  return {
    name: process.env.DIADOC_OUR_SHORTNAME,
    BoxId: process.env.DIADOC_OUR_BOXGUID,
    OrgIdGuid: process.env.DIADOC_OUR_ORGIDGUID,
    FnsParticipantId: process.env.DIADOC_OUR_FNSPARTICIPANTID,
    bayerInn: process.env.DIADOC_OUR_INN,
    bayerKpp: process.env.DIADOC_OUR_KPP,
  };
}
