import { IsInt, IsNotEmpty, IsOptional, isString, IsString, IsUrl, MaxLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateTeamDto {
  @IsString()
  team_name: string;

  @IsString()
  url_paste?: string;

  @IsInt()
  format_id: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'date_created' })
  date_created: Date;

  @IsString()
  desc_uso?: string;

  @IsString()
  tournament_using?: string;

  @IsString()
  mus_fav?: string;

  @IsString()
  counters?: string;

  @IsString()
  damage_calcs?: string;

  is_public: boolean;

  @IsInt()
  user_id: number;
}
