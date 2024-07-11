import { Controller, Get, Param } from '@nestjs/common';
import { DiadocService } from './diadoc.service';

@Controller('diadoc')
export class DiadocController {
  constructor(private diadoc: DiadocService) {}

  @Get('doctypes')
  getDocTypes() {
    return this.diadoc.getDocumentTypes();
  }

  @Get(':inn')
  findByInn(@Param('inn') inn: string) {
    return this.diadoc.getOrganization(inn);
  }
}
