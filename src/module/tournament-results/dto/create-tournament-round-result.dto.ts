import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTournamentRoundResultDto {
  @IsString()
  @IsNotEmpty()
  playerName: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  section?: number;

  @IsInt()
  @Min(0)
  wins: number;

  @IsInt()
  @Min(0)
  losses: number;

  @IsInt()
  @Min(0)
  draws: number;
}
