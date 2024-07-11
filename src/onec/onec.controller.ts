import { Controller, Post, Body, Get } from '@nestjs/common';
import { IUtData } from './types/ut.create-data';
import { OnecService } from './onec.service';
import {
  IOnecCreateResultData,
  IOnecCreateResultReportData,
} from './types/ut-create-data';
import { Bid } from 'src/bid/entities/bid.entity';

@Controller('onec')
export class OnecController {
  constructor(private onec: OnecService) {}

  @Post('createUpdUt')
  async createUt(@Body() dto: Bid): Promise<IOnecCreateResultData> {
    return this.onec.createUpdSailer(dto);
  }

  @Post('createUpdOnec')
  async createOnec(@Body() dto: Bid): Promise<IOnecCreateResultReportData> {
    return this.onec.createUpdBayer(dto);
  }
}
