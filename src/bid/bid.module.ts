import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [SequelizeModule.forFeature([Bid])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
