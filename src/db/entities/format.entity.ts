import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Team } from './team.entity';

@Entity('formats')
export class Format {
  @PrimaryGeneratedColumn()
  id: number;  // Identificador único del formato

  @Column({ length: 50, unique: true })
  formatName: string;  // Nombre del formato (VGC, OU, UU, etc.)

  @OneToMany(() => Team, (team) => team.format)
  teams: Team[];  // Relación uno-a-muchos con la tabla teams (un formato puede tener muchos equipos)
}
