import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { IBid, IPay } from './types/invoce';
import { PendalException } from './lib/pendal-exception';
import { PendalLogger } from './pendal-logger/pendal-logger.service';
import { writeFileSync } from 'node:fs';
import { WebSocketGateway } from '@nestjs/websockets';

@Controller()
export class AppController {
  constructor(
    readonly appService: AppService,
    readonly logger: PendalLogger,
  ) {}

  @Post('createbid')
  async createBid(@Body() dto: IBid) {
    try {
      writeFileSync('realbid.json', JSON.stringify(dto, null, 2));
      // const res = await fetch(
      //   'http://147.45.141.26:80/ut-copy/hs/exchange_site/data/new_order',
      //   {
      //     credentials: 'include',
      //     method: 'POST',
      //     body: JSON.stringify(dto, null, 2),
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Basic ${Buffer.from('ОбменССайтомБот' + ':' + '12345', 'utf8').toString('base64')}`,
      //     },
      //   },
      // );
      // if (res.ok) {
      //   return await res.json();
      // } else {
      //   return { status: 'error', data: await res.text() };
      //   console.log(res.statusText);
      // }

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

  @Post('test')
  async test(@Body() dto: IPay) {
    await new Promise((res) => {
      setTimeout(() => res(true), 2000);
    });
    return dto;
  }

  @Get('ws')
  async Chat(@Res() res) {
    res.json({ test: 1 });
  }
}
