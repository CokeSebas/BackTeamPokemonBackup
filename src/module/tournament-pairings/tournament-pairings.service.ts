import { Injectable } from '@nestjs/common';
import { CreateTournamentPairingDto } from './dto/create-tournament-pairing.dto';
import { UpdateTournamentPairingDto } from './dto/update-tournament-pairing.dto';

@Injectable()
export class TournamentPairingsService {
  create(createTournamentPairingDto: CreateTournamentPairingDto) {
    return 'This action adds a new tournamentPairing';
  }

  findAll() {
    return `This action returns all tournamentPairings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tournamentPairing`;
  }

  update(id: number, updateTournamentPairingDto: UpdateTournamentPairingDto) {
    return `This action updates a #${id} tournamentPairing`;
  }

  remove(id: number) {
    return `This action removes a #${id} tournamentPairing`;
  }
}
