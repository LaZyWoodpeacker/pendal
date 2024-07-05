import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { IBid, IPay } from './types/invoce';
import { PendalException } from './lib/pendal-exception';
import { PendalLogger } from './pendal-logger/pendal-logger.service';

@Controller()
export class AppController {
  constructor(
    readonly appService: AppService,
    readonly logger: PendalLogger,
  ) {}

  @Post('createbid')
  async createBid(@Body() dto: IBid) {
    try {
      return await this.appService.createBid(dto);
    } catch (e) {
      if (e instanceof PendalException) {
        this.logger.errorJson(
          `Такая заявка(${e.bidId}) уже существует`,
          e.bidId,
        );
        throw new HttpException(
          `Такая заявка(${e.bidId}) уже существует`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw e;
    }
  }

  @Post('paybid')
  async payBid(@Body() dto: IPay) {
    return this.appService.payBid(dto);
  }
}
