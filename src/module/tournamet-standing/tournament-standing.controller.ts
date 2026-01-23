import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TournamentStandingService } from './tournament-standing.service';

@Controller('tournament-standing')
export class TournamentStandingController {
  constructor(
    private readonly tournamentStandingService: TournamentStandingService,
  ) {}

  @Post('upload-standing/:tournamentId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStanding(
    @Param('tournamentId') tournamentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe enviar un archivo HTML',
      );
    }

    if (!file.mimetype.includes('html')) {
      throw new BadRequestException(
        'El archivo debe ser de tipo HTML',
      );
    }

    await this.tournamentStandingService.registerStandingFromHtml(
      Number(tournamentId),
      file.buffer.toString('utf-8'),
    );

    return {
      message: 'Standing cargado correctamente',
    };
  }

  @Get(':tournamentId')
  async getStandingByTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.tournamentStandingService.getStandingByTournamentId(
      tournamentId,
    );
  }
}
