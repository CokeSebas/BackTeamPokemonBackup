import {
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTournamentRoundResultDto } from './create-tournament-round-result.dto';

export class CreateRoundResultsDto {
  @IsInt()
  @Min(1)
  roundId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateTournamentRoundResultDto)
  results: CreateTournamentRoundResultDto[];
}
