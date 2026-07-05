import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MatchPokemon } from './match-pokemon.entity';
import { User } from '../entities/user.entity';

@Entity('matches')
@Unique('unique_round_per_user_tournament', ['user', 'tournamentName', 'round'])
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tournament_name', type: 'text' })
  tournamentName: string;

  @Column({ name: 'opponent_name', type: 'text' })
  opponentName: string;

  @Column({ type: 'text' })
  result: 'win' | 'loss' | 'tie';

  @Column({ type: 'int' })
  round: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 🔗 USER
  @ManyToOne(() => User, (user) => user.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' }) // 🔥 importante
  user: User;

  // 🔗 POKEMONS
  @OneToMany(() => MatchPokemon, (mp) => mp.match, {
    cascade: true,
    eager: true,
  })
  pokemons: MatchPokemon[];
}