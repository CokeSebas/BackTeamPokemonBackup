import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Max, isString } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  item?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ability?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tera_type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_hp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_atk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_def?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_spa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_spd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evs_spe?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_hp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_atk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_def?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_spa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_spd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivs_spe?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nature?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  move1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  move2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  move3?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  move4?: string;

  @IsInt()
  user_id: number;
  
  is_public: boolean;

  @IsString()
  spread_use?: string;

  @IsString()
  team_mates?: string;

  @IsString()
  calculos_principales?: string;

  @IsString()
  nick_poke?: string;

  @IsString()
  paste_sd?: string;
}
