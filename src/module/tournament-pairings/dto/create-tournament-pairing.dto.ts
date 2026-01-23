// dto/create-tournament-pairing.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTournamentPairingDto {
  @IsInt()
  @Min(1)
  tableNumber: number;

  @IsString()
  @IsNotEmpty()
  playerName: string;

  @IsOptional()
  @IsString()
  playerRecord?: string;

  @IsString()
  @IsNotEmpty()
  opponentName: string;

  @IsOptional()
  @IsString()
  opponentRecord?: string;
}
