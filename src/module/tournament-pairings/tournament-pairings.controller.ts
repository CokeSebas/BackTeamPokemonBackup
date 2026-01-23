import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TournamentPairingsService } from './tournament-pairings.service';
import { CreateTournamentPairingDto } from './dto/create-tournament-pairing.dto';
import { UpdateTournamentPairingDto } from './dto/update-tournament-pairing.dto';

@Controller('tournament-pairings')
export class TournamentPairingsController {
  constructor(private readonly tournamentPairingsService: TournamentPairingsService) {}

  @Post()
  create(@Body() createTournamentPairingDto: CreateTournamentPairingDto) {
    return this.tournamentPairingsService.create(createTournamentPairingDto);
  }

  @Get()
  findAll() {
    return this.tournamentPairingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentPairingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTournamentPairingDto: UpdateTournamentPairingDto) {
    return this.tournamentPairingsService.update(+id, updateTournamentPairingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentPairingsService.remove(+id);
  }
}
