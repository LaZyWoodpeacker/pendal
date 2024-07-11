import { writeFile } from 'fs/promises';

export default function writeBid(bid) {
  writeFile(`mon/bid.${bid.bidId}.json`, JSON.stringify(bid, null, 2));
}
