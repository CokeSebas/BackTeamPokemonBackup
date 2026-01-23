import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tournaments } from './tournaments.entity';

@Entity('tournament_standing')
export class TournamentStanding {
  @PrimaryGeneratedColumn('increment')
  id: number;

  /* ===============================
     Relaciones
  =============================== */

  @Column({ name: 'tournament_id' })
  tournamentId: number;

  @ManyToOne(() => Tournaments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournaments;

  /* ===============================
     Ranking
  =============================== */

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'player_name', length: 150 })
  playerName: string;

  /* ===============================
     Datos del standing
  =============================== */

  @Column({ type: 'int' })
  section: number;

  @Column({
    name: 'withdrawal_round',
    type: 'int',
    nullable: true,
  })
  withdrawalRound: number | null;

  /* ===============================
     Resultados
  =============================== */

  @Column({ type: 'int', default: 0 })
  wins: number;

  @Column({ type: 'int', default: 0 })
  losses: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @Column({ type: 'int' })
  points: number;

  /* ===============================
     Porcentajes
  =============================== */

  @Column({
    name: 'opponent_win_percentage',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  opponentWinPercentage: number;

  @Column({
    name: 'opponent_opponent_win_percentage',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  opponentOpponentWinPercentage: number;

  /* ===============================
     Contexto
  =============================== */

  @Column({ name: 'round_label', length: 50 })
  roundLabel: string;

  @Column({ length: 100 })
  category: string;

  /* ===============================
     Auditoría
  =============================== */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
