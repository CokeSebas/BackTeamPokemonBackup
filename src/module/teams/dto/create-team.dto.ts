import { IsInt, IsNotEmpty, IsOptional, isString, IsString, IsUrl, MaxLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateTeamDto {
  @IsString()
  teamName: string;

  @IsString()
  urlPaste?: string;

  @IsInt()
  formatId: number;

  @IsOptional()
  dateCreated?: Date;

  @IsString()
  descUso?: string;

  @IsString()
  tournamentUsing?: string;

  @IsString()
  musFav?: string;

  @IsString()
  counters?: string;

  @IsString()
  damageCalcs?: string;

  isPublic: boolean;

  @IsInt()
  userId: number;

  @IsInt()
  subFormatId: number;

  @IsString()
  poke1?: string;
  @IsString()
  poke2?: string;
  @IsString()
  poke3?: string;
  @IsString()
  poke4?: string;
  @IsString()
  poke5?: string;
  @IsString()
  poke6?: string;
}
