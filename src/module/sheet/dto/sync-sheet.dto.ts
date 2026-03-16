// sync-sheet.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SyncSheetDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  subFormatId: number;
}