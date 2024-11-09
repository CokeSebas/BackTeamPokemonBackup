import { IsInt, IsNotEmpty, IsOptional, isString, IsString, IsUrl, MaxLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateTeamDto {
  @IsString()
  teamName: string;

  @IsString()
  urlPaste?: string;

  @IsInt()
  formatId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'date_created' })
  dateCreated: Date;

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
}
