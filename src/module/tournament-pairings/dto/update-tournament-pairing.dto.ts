import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentPairingDto } from './create-tournament-pairing.dto';

export class UpdateTournamentPairingDto extends PartialType(CreateTournamentPairingDto) {}
