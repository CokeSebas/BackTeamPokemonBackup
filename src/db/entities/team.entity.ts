import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { SubFormat } from './subFormat.entity';


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

  @ManyToOne(() => SubFormat)
  @JoinColumn({ name: 'sub_format_id' })
  subformat: SubFormat;

  @Column({name: 'poke1'})
  poke1: string;

  @Column({name: 'poke2'})
  poke2: string;

  @Column({name: 'poke3'})
  poke3: string;

  @Column({name: 'poke4'})
  poke4: string;

  @Column({name: 'poke5'})
  poke5: string;

  @Column({name: 'poke6'})
  poke6: string;

}
