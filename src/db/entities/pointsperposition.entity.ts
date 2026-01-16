import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn } from "typeorm";
import { Tournaments } from "./tournaments.entity";

@Entity('pointsperposition')
export class PointsPerPosition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'rango_posicion'})
  rangoPosicion: string;

  @Column()
  kicker: number;

  @Column()
  puntos: number;

  @Column({name: 'torneo_id'})
  torneoId: number;

  @ManyToMany(() => Tournaments)
  @JoinColumn({name: 'torneo_id'})
  torneo: Tournaments;
}