import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsTimeZone, isNumber } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  nombre: string;

  @IsNumber()
  tipo_torneo: number; 

  @IsTimeZone()
  fecha_torneo: Date; 

  @IsNumber()
  user_id: number; 
}
