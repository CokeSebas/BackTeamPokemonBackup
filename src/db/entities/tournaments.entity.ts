import { IsInt } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { TournamentTopPlayer } from "./tournament-top-player.entity";
import { TournamentStanding } from "./tournament-standing.entity";

@Entity()
export class Tournaments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'nombre'})
  nombre: string;

  @Column()
  tipo_torneo: string;

  @Column()
  fecha_torneo: Date;

  @IsInt()
  @Column({name: 'user_id'})
  userId: number;

  @Column()
  formato_torneo: string;

  @OneToMany(
    () => TournamentTopPlayer,
    (top) => top.tournament,
  )
  tops: TournamentTopPlayer[];

  @OneToMany(
    () => TournamentStanding,
    standing => standing.tournament,
    { eager: false },
  )
  standings: TournamentStanding[];

}