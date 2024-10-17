import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Teams {
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

  @Column({name: 'desc_uso'})
  descUso?: string;

  @Column({name: 'tournament_using'})
  tournamentUsing?: string;

  @Column({name: 'mus_fav'})
  musFav?: string;

  @Column({name: 'counters'})
  counters?: string;

  @Column({name: 'damage_calcs'})
  damageCalcs?: string;

  @Column({name: 'is_public', default: false})
  isPublic: boolean;

}
