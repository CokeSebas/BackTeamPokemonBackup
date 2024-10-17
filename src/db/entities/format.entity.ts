import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('formats')
export class Format {
  @PrimaryGeneratedColumn()
  id: number;  // Identificador único del formato

  @Column({ length: 50, unique: true, name: 'format_name' })
  formatName: string;  // Nombre del formato (VGC, OU, UU, etc.)
}
