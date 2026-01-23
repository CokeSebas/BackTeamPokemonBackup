// dto/create-tournament-round.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTournamentPairingDto } from '../../tournament-pairings/dto/create-tournament-pairing.dto';

export class CreateTournamentRoundDto {
  @IsInt()
  @Min(1)
  tournamentId: number;

  @IsInt()
  @Min(1)
  roundNumber: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  generatedAt?: Date;

  @ValidateNested({ each: true })
  @Type(() => CreateTournamentPairingDto)
  pairings: CreateTournamentPairingDto[];
}
