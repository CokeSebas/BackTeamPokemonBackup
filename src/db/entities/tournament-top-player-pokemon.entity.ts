import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TournamentTopPlayer } from './tournament-top-player.entity';
import { Pokemon } from './list-pokemons.entity';

@Entity('tournament_top_player_pokemon')
export class TournamentTopPlayerPokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'top_player_id' })
  topPlayerId: number;

  @ManyToOne(
    () => TournamentTopPlayer,
    (topPlayer) => topPlayer.pokemons,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'top_player_id' })
  topPlayer: TournamentTopPlayer;

  @Column({ name: 'pokemon_id' })
  pokemonId: number;

  @ManyToOne(() => Pokemon)
  @JoinColumn({ name: 'pokemon_id' })
  pokemon: Pokemon;

  @Column()
  slot: number; // 1 a 6 (orden del equipo)
}
