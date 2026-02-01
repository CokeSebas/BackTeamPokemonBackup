import { IsInt, ValidateNested, ArrayMinSize, isString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTournamentTopPlayerInputDto } from './create-tournament-top-player-input.dto';

export class CreateTournamentTopDto {
  @IsInt()
  tournamentId: number;

  formatoTorneo: string;

  @ValidateNested({ each: true })
  @Type(() => CreateTournamentTopPlayerInputDto)
  @ArrayMinSize(1)
  players: CreateTournamentTopPlayerInputDto[];
}
