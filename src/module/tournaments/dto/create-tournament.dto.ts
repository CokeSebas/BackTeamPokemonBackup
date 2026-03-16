import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsTimeZone, isNumber } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  nombre: string;

  @IsString()
  tipo_torneo: string; 

  @IsTimeZone()
  fecha_torneo: Date; 

  @IsNumber()
  user_id: number; 

  @IsString()
  formato_torneo: string;
}
