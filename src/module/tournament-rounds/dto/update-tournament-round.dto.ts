import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentRoundDto } from './create-tournament-round.dto';

export class UpdateTournamentRoundDto extends PartialType(CreateTournamentRoundDto) {}
