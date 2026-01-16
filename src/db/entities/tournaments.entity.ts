import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tournaments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'nombre'})
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  bfl: number;

}