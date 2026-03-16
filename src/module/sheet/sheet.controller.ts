import { Body, Controller, Get, Post } from '@nestjs/common';
import { SheetService } from './sheet.service';
import { SyncSheetDto } from './dto/sync-sheet.dto';

@Controller('sheet')
export class SheetController {
  constructor(private readonly sheetService: SheetService) {}

  //@Get()
  //async readSheet() {
  //  console.log('Syncing from Google Sheet...');
  //  return this.sheetService.syncFromGoogleSheet();
  //}

  @Post('sync-sheet')
  async readSheet(@Body() body: SyncSheetDto) {
    console.log('Syncing from Google Sheet...');
    return this.sheetService.syncFromGoogleSheet(
      body.url,
      body.subFormatId,
    );
  }

  
}
