import {
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MatchItemDto } from './match-item.dto';

export class CreateBulkMatchDto {

  @IsInt()
  userId: number;

  @IsString()
  tournamentName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MatchItemDto)
  matches: MatchItemDto[];
}