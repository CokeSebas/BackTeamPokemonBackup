// dto/parse-paste.dto.ts
import { IsNumber, IsString } from 'class-validator';

export class ParsePasteDto {
  @IsString()
  url: string;

  @IsNumber()
  subformat: number;
}