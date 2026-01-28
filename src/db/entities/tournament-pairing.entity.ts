// entities/tournament-pairing.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TournamentRoundEntity } from './tournament-round.entity';

@Entity('tournament_pairing')
@Index(['roundId', 'tableNumber'])
export class TournamentPairingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'round_id' })
  roundId: number;

  @ManyToOne(
    () => TournamentRoundEntity,
    round => round.pairings,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'round_id' })
  round: TournamentRoundEntity;

  //@Column({ name: 'table_number', type: 'int' })
  //tableNumber: number;

  @Column({ name: 'player_name', type: 'varchar', length: 150 })
  playerName: string;

  @Column({
    name: 'player_record',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  playerRecord?: string;

  @Column({ name: 'opponent_name', type: 'varchar', length: 150 })
  opponentName: string;

  @Column({
    name: 'opponent_record',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  opponentRecord?: string;

  @Column({ name: 'is_bye', type: 'boolean', default: false })
  isBye: boolean;

  @Column({ name: 'table_number', type: 'int', nullable: true })
  tableNumber: number | null;


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
