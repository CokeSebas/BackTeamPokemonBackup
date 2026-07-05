export class CreateMatchDto {
  tournamentName: string;
  round: number;
  opponentName: string;
  result: 'win' | 'loss';

  pokemons: {
    pokemonId: number;
    slot: number;
  }[];
}