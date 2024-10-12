import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

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
  teraType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsHp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsAtk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsDef?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsSpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsSpd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  evsSpe?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsHp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsAtk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsDef?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsSpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsSpd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  ivsSpe?: number;

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
}
