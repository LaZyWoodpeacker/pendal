import { Bid } from 'src/bid/entities/bid.entity';
import { IOnecCreateResultReportData } from 'src/onec/types/ut-create-data';

export default async function sendBidToOnec(
  bid: Bid,
): Promise<IOnecCreateResultReportData> {
  const response = await fetch('http://localhost:3000/onec/createUpdOnec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(bid.toJSON()),
  });
  return response.json();
}
