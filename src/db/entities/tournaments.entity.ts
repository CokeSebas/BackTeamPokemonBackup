import { IsInt } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tournaments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'nombre'})
  nombre: string;

  @Column({ type: 'integer' })
  tipo_torneo: number;

  @Column()
  fecha_torneo: Date;

  @IsInt()
  @Column({name: 'user_id'})
  userId: number;

}