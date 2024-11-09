import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('subformats')
export class SubFormat {
  @PrimaryGeneratedColumn()
  id: number;  // Identificador único del formato

  @Column({ length: 50, unique: true, name: 'sub_format_name' })
  subFormatName: string;  // Nombre del formato (regs)
  
  @Column({ length: 50, unique: true, name: 'abrev_sub_format' })
  abrevSubFormat: string;  // Nombre del formato (regsH)
}
