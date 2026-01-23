import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentResultDto } from './create-tournament-result.dto';

export class UpdateTournamentResultDto extends PartialType(CreateTournamentResultDto) {}
