import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;  // Nombre completo del usuario

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;  // Correo electrónico del usuario (debe ser válido)

  @IsString()
  passwordHash: string;  // Contraseña del usuario (opcional si se utiliza OAuth)

  @IsString()
  @IsOptional()  // Este campo es opcional si el usuario se registra a través de Google
  avatarUrl?: string;  // URL de la imagen de perfil del usuario

  @IsEnum(['local', 'google'])
  provider: 'local' | 'google';  // Proveedor de autenticación

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
