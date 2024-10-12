import { IsInt, IsNotEmpty, IsOptional, isString, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  teamName: string;

  @IsString()
  urlPaste?: string;

  @IsInt()
  formatId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
