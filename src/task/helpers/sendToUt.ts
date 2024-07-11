import { Bid } from 'src/bid/entities/bid.entity';
import { IOnecCreateResultData } from 'src/onec/types/ut-create-data';

export default async function sendBidToUT(
  bid: Bid,
): Promise<IOnecCreateResultData> {
  const response = await fetch('http://localhost:3000/onec/createUpdUt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(bid.toJSON()),
  });
  return response.json();
}
