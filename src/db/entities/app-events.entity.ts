import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('app_events')
export class AppEvent {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({
    name: 'team_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  teamName: string | null;

  @Column({
    name: 'action_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  actionType: string | null;

  @Column({
    name: 'language',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  language: string | null;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt: Date;
}