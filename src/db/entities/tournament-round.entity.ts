// entities/tournament-round.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Tournaments } from './tournaments.entity';
import { TournamentPairingEntity } from './tournament-pairing.entity';
import { TournamentRoundResultEntity } from './tournament-result.entity';

@Entity('tournament_round')
@Unique(['tournament', 'roundNumber', 'category'])
export class TournamentRoundEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'tournament_id' })
  tournamentId: number;

  @ManyToOne(() => Tournaments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournaments;

  @Column({ name: 'round_number', type: 'int' })
  roundNumber: number;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({
    name: 'generated_at',
    type: 'timestamp',
    nullable: true,
  })
  generatedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => TournamentPairingEntity,
    pairing => pairing.round,
    { cascade: true }
  )
  pairings: TournamentPairingEntity[];

  @OneToMany(
    () => TournamentRoundResultEntity,
    result => result.round,
    { cascade: true },
  )
  results: TournamentRoundResultEntity[];

}
