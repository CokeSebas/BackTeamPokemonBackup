import { IsString, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateTournamentTopPlayerInputDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  pokemons: string[]; // nombres
}
