import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Team } from './team.entity';

@Entity('pokemon_builds')
export class PokemonBuild {
  @PrimaryGeneratedColumn()
  id: number;  // Identificador único del Pokémon

  @Column({ length: 50 })
  name: string;  // Nombre del Pokémon

  @Column({ length: 50 })
  item: string;  // Objeto del Pokémon

  @Column({ length: 50 })
  ability: string;  // Habilidad del Pokémon

  @Column({ length: 20 })
  teraType: string;  // Tipo Tera del Pokémon

  @Column({ type: 'int', default: 0 })
  evsHp: number;  // EVs en HP

  @Column({ type: 'int', default: 0 })
  evsAtk: number;  // EVs en Ataque

  @Column({ type: 'int', default: 0 })
  evsDef: number;  // EVs en Defensa

  @Column({ type: 'int', default: 0 })
  evsSpa: number;  // EVs en Ataque Especial

  @Column({ type: 'int', default: 0 })
  evsSpd: number;  // EVs en Defensa Especial

  @Column({ type: 'int', default: 0 })
  evsSpe: number;  // EVs en Velocidad

  @Column({ type: 'int', default: 31 })
  ivsHp: number;  // IVs en HP

  @Column({ type: 'int', default: 31 })
  ivsAtk: number;  // IVs en Ataque

  @Column({ type: 'int', default: 31 })
  ivsDef: number;  // IVs en Defensa

  @Column({ type: 'int', default: 31 })
  ivsSpa: number;  // IVs en Ataque Especial

  @Column({ type: 'int', default: 31 })
  ivsSpd: number;  // IVs en Defensa Especial

  @Column({ type: 'int', default: 31 })
  ivsSpe: number;  // IVs en Velocidad

  @Column({ length: 20 })
  nature: string;  // Naturaleza del Pokémon

  @Column({ length: 50 })
  move1: string;  // Movimiento 1

  @Column({ length: 50 })
  move2: string;  // Movimiento 2

  @Column({ length: 50 })
  move3: string;  // Movimiento 3

  @Column({ length: 50 })
  move4: string;  // Movimiento 4

  @ManyToOne(() => Team, (team) => team.pokemonBuilds, { onDelete: 'CASCADE' })
  team: Team;  // Relación con la tabla teams
}
