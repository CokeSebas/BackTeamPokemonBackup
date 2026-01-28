import { IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTournamentTopPlayerInputDto } from './create-tournament-top-player-input.dto';

export class CreateTournamentTopDto {
  @IsInt()
  tournamentId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateTournamentTopPlayerInputDto)
  @ArrayMinSize(1)
  players: CreateTournamentTopPlayerInputDto[];
}
