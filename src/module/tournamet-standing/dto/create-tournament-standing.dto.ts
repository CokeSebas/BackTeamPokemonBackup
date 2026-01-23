import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTournamentStandingDto {
  @IsInt()
  tournamentId: number;

  @IsInt()
  @Min(1)
  position: number;

  @IsString()
  @IsNotEmpty()
  playerName: string;

  @IsInt()
  section: number;

  @IsOptional()
  @IsInt()
  withdrawalRound?: number;

  @IsInt()
  wins: number;

  @IsInt()
  losses: number;

  @IsInt()
  draws: number;

  @IsInt()
  points: number;

  @IsNumber()
  opponentWinPercentage: number;

  @IsNumber()
  opponentOpponentWinPercentage: number;

  @IsString()
  roundLabel: string;

  @IsString()
  category: string;
}
