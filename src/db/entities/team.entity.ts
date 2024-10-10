import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Format } from './format.entity';
import { PokemonBuild } from './pokemon_build.entity';  // Asegúrate de que esta importación sea correcta

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;  // Identificador único del equipo

  @Column({ length: 100 })
  teamName: string;  // Nombre del equipo

  @Column({ length: 255, nullable: true })
  urlPaste: string;  // URL donde se ha compartido o registrado el equipo

  @CreateDateColumn({ type: 'timestamptz' })
  dateCreated: Date;  // Fecha de creación del equipo

  @ManyToOne(() => User, (user) => user.teams, { onDelete: 'CASCADE' })
  user: User;  // Relación con la tabla users (muchos equipos pertenecen a un usuario)

  @ManyToOne(() => Format, (format) => format.teams, { onDelete: 'RESTRICT' })
  format: Format;  // Relación con la tabla formats (cada equipo tiene un formato)

  @OneToMany(() => PokemonBuild, (pokemonBuild) => pokemonBuild.team)  // Relación uno-a-muchos
  pokemonBuilds: PokemonBuild[];  // Relación con la tabla pokemon_builds
}
