import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn } from "typeorm";
import { Tournaments } from "./tournaments.entity";

@Entity()
export class MyTournament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  posicion: number

  @Column()
  puntos: number

  @Column({name: 'fecha_participacion'})
  fechaParticipacion: Date

  @Column({name: 'user_id'})
  userId: number;

  @Column({name: 'torneo_id'})
  torneoId: number;
  
  @ManyToMany(() => Tournaments)
  @JoinColumn({name: 'torneo_id'})
  torneo: Tournaments
}