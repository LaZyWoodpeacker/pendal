import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Bid } from './entities/bid.entity';
import { IBid } from 'src/types/invoce';
import { PendalLogger } from 'src/pendal-logger/pendal-logger.service';
import { PendalException, PendalExceptionType } from 'src/lib/pendal-exception';

@Injectable()
export class BidService {
  constructor(private logger: PendalLogger) {}

  async create(dto: IBid): Promise<Bid> {
    try {
      const result = await Bid.create({
        bidId: dto.bidId,
        data: JSON.stringify(dto),
        sailerInn: dto.seller.inn,
        sailerKpp: dto.seller.kpp,
        bayerInn: dto.bayer.inn,
        bayerKpp: dto.bayer.kpp,
        isActive: true,
      });
      return result;
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError' && 'bidId' in e.fields) {
        throw new PendalException(
          `Такая заявка(${dto.bidId}) уже существует`,
          PendalExceptionType.alreadyHaveBid,
          dto.bidId,
        );
      }
      throw e;
    }
  }

  async findAll(): Promise<Bid[]> {
    return Bid.findAll();
  }

  async findOne(id: string): Promise<Bid> {
    const bid = await Bid.findOne({ where: { bidId: id } });
    if (!bid) throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
    return bid;
  }

  async remove(id: string) {
    const bid = await this.findOne(id);
    bid.destroy();
    return bid;
  }

  logBid(bid: Bid, message: string = null): void {
    if (!message) {
      this.logger.logJson(`Обработка заявки`, bid.bidId, bid);
    } else {
      this.logger.logJson(message, bid.bidId, bid);
    }
  }

  logBidObj(bid: Bid, obj: Object, message: string = null): void {
    if (!message) {
      this.logger.logJson(`Обработка заявки`, bid.bidId, obj);
    } else {
      this.logger.logJson(message, bid.bidId, obj);
    }
  }
}
