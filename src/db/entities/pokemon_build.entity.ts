import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;  // Campo obligatorio para la actualización

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

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
  @Column({name: 'tera_type'})
  teraType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_hp'})
  evsHp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_atk'})
  evsAtk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_def'})
  evsDef?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_spa'})
  evsSpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_spd'})
  evsSpd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(252)
  @Column({name: 'evs_spe'})
  evsSpe?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_hp'})
  ivsHp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_atk'})
  ivsAtk?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_def'})
  ivsDef?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_spa'})
  ivsSpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_spd'})
  ivsSpd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  @Column({name: 'ivs_spe'})
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
