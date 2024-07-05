import { Controller, Get, Param } from '@nestjs/common';
import { DiadocService } from './diadoc.service';

@Controller('diadoc')
export class DiadocController {
  constructor(private diadoc: DiadocService) {}

  @Get(':inn')
  findByInn(@Param('inn') inn: string) {
    return this.diadoc.GetOrganization(inn);
  }
}
