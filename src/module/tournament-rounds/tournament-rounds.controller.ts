import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { TournamentRoundsService } from './tournament-rounds.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tournament-rounds')
export class TournamentRoundsController {
  constructor(private readonly tournamentRoundsService: TournamentRoundsService) {}

  @Post('/upload-round/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRound( @UploadedFile() file: Express.Multer.File, @Param('id') idTorneo: number) {
    if (!file) {
      throw new BadRequestException('Archivo no enviado');
    }

    if (!file.originalname.endsWith('.html')) {
      throw new BadRequestException('El archivo debe ser HTML');
    }

    return this.tournamentRoundsService.parseAndSave(
      file.buffer.toString('utf-8'),idTorneo
    );
  }
  

  @Get('/latest-round/:id')
  async getLatestRound(
    @Param('id', ParseIntPipe) tournamentId: number,
  ) {
    const round =
      await this.tournamentRoundsService.findLatestRound(
        tournamentId,
      );

    if (!round) {
      throw new NotFoundException(
        'El torneo no tiene rondas registradas',
      );
    }

    return round;
  }

}
