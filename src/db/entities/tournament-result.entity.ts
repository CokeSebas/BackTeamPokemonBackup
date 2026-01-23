import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { TournamentRoundEntity } from './tournament-round.entity';

@Entity('tournament_round_result')
@Unique(['roundId', 'playerName'])
export class TournamentRoundResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'round_id' })
  roundId: number;

  @ManyToOne(
    () => TournamentRoundEntity,
    round => round.results,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'round_id' })
  round: TournamentRoundEntity;

  @Column({
    name: 'player_name',
    type: 'varchar',
    length: 150,
  })
  playerName: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  section?: number;

  @Column({ type: 'int', default: 0 })
  wins: number;

  @Column({ type: 'int', default: 0 })
  losses: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
