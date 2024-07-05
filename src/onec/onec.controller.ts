import { Controller, Post, Body, Get } from '@nestjs/common';
import { IUtData } from './types/ut.create-data';
import { OnecService } from './onec.service';
import { IOnecCreateResultData } from './types/ut-create-data';

@Controller('onec')
export class OnecController {
  constructor(private onec: OnecService) {}

  @Post('createUpdUt')
  async createUt(@Body() dto: IUtData): Promise<IOnecCreateResultData> {
    return this.onec.createUpdSailer({
      ...dto,
    });
  }

  @Post('createUpdOnec')
  async createOnec(@Body() dto: IUtData): Promise<IOnecCreateResultData> {
    return this.onec.createUpdBayer({
      ...dto,
    });
  }
}
