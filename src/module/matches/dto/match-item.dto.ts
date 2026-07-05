import {
  IsString,
  IsIn,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

// 🔥 DTO para cada Pokémon
export class MatchPokemonDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsString()
  name: string;
}

// 🔥 DTO del match
export class MatchItemDto {
  @IsString()
  opponentName: string;

  @IsIn(['win', 'loss', 'tie'])
  result: 'win' | 'loss' | 'tie';

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => MatchPokemonDto)
  pokemons: MatchPokemonDto[];

  @IsInt()
  @Min(1)
  round: number;
}