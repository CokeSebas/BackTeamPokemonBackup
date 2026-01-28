import { IsInt, Min, Max } from 'class-validator';

export class CreateTopPlayerPokemonDto {
  @IsInt()
  pokemonId: number;

  @IsInt()
  @Min(1)
  @Max(6)
  slot: number;
}
