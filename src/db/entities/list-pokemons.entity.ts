import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('list_pokemons')
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', unique: true })
  name: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;
}
