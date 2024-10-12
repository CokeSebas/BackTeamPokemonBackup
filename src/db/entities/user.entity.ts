import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Team } from './team.entity' // Si tienes una entidad para los equipos (teams)

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number; // Identificador único del usuario

  @Column({ length: 255 })
  name: string; // Nombre completo del usuario

  @Column({ length: 255, name: 'last_name' })
  lastName: string; // Apellidos del usuario

  @Column({ length: 255, unique: true })
  email: string; // Correo electrónico del usuario (único)

  @Column({ length: 255, nullable: true, name: 'password_hash' })
  passwordHash: string; // Hash de la contraseña (nullable si usan OAuth)

  @Column({ length: 255, unique: true, nullable: true, name: 'google_id' })
  googleId: string; // ID de Google para OAuth

  @Column({
    type: 'enum',
    enum: ['local', 'google'],
    default: 'local',
  })
  provider: string; // Proveedor de autenticación (local o google)

  @Column({ length: 255, nullable: true, name: 'avatar_url' })
  avatarUrl: string; // URL de la imagen de perfil del usuario

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date; // Fecha de creación del registro

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date; // Fecha de última actualización

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;
}
