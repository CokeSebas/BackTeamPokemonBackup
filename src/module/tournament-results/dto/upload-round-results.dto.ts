import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoundResultsDto } from './create-round-results.dto';

export class UploadRoundResultsDto {
  @ValidateNested()
  @Type(() => CreateRoundResultsDto)
  round: CreateRoundResultsDto;
}
