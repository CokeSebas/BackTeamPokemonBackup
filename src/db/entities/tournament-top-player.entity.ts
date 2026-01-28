import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tournaments } from './tournaments.entity';
import { TournamentTopPlayerPokemon } from './tournament-top-player-pokemon.entity';

@Entity('tournament_top_players')
export class TournamentTopPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column( {name: 'tournament_id'})
  tournamentId: number;

  @ManyToOne(() => Tournaments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournaments;

  @Column()
  position: number; // 1,2,3,4...

  @Column({name: 'first_name'})
  firstName: string;

  @Column({name: 'last_name'})
  lastName: string;

  @OneToMany(
    () => TournamentTopPlayerPokemon,
    (tp) => tp.topPlayer,
    { cascade: true },
  )
  pokemons: TournamentTopPlayerPokemon[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
