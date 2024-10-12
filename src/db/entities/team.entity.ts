import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, name: 'team_name' })
  teamName: string;

  @Column({ length: 255, nullable: true, name: 'url_paste' })
  urlPaste: string;

  @Column({name : 'format_id'})
  formatId: number;

  @Column({name : 'user_id'})
  userId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name : 'date_created' })
  dateCreated: Date;
}
