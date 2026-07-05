import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Match } from './match.entity';
import { Pokemon } from './list-pokemons.entity'; // 👈 si tienes esta tabla

@Entity('match_pokemons')
export class MatchPokemon {

  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 RELACIÓN CON MATCH
  @ManyToOne(() => Match, match => match.pokemons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'match_id' })
  matchId: number;

  // 🔥 NUEVO: FK POKEMON
  @ManyToOne(() => Pokemon, { eager: false }) // puedes poner eager: true si quieres autoload
  @JoinColumn({ name: 'pokemon_id' })
  pokemon: Pokemon;

  @Column({ name: 'pokemon_id', type: 'int' })
  pokemonId: number;

  // 🧠 SNAPSHOT (opcional pero recomendado)
  @Column({ name: 'pokemon_name', type: 'text' })
  pokemonName: string;

  // 🎯 POSICIÓN (1–6)
  @Column({ type: 'int' })
  slot: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}