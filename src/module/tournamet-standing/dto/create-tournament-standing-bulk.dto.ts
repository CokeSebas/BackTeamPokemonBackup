import {
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTournamentStandingDto } from './create-tournament-standing.dto';

export class CreateTournamentStandingBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTournamentStandingDto)
  rows: CreateTournamentStandingDto[];
}
