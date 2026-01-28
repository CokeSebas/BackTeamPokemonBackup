import {
  IsInt,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTopPlayerPokemonDto } from './create-top-player-pokemon.dto';

export class CreateTournamentTopPlayerDto {
  @IsInt()
  tournamentId: number;

  @IsInt()
  @Min(1)
  position: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @ValidateNested({ each: true })
  @Type(() => CreateTopPlayerPokemonDto)
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  pokemons: CreateTopPlayerPokemonDto[];
}
