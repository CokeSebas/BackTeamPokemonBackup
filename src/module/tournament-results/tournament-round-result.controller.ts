import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TournamentRoundResultService } from './tournament-round-result.service';

@Controller('tournament-results')
export class TournamentRoundResultController {
  constructor(
    private readonly resultService: TournamentRoundResultService,
  ) {}

  /**
   * POST /tournaments/rounds/:tournamentId/upload-results
   */
  @Post('/upload-results/:tournamentId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResults(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo no enviado');
    }

    if (!file.originalname.endsWith('.html')) {
      throw new BadRequestException('El archivo debe ser HTML');
    }

    return this.resultService.parseAndSave(
      tournamentId,
      file.buffer.toString('utf-8'),
    );
  }

  @Get('/latest-round/results/:tournamentId')
  async getLatestRoundResults(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.resultService.getLatestRoundResultsByTournament(
      tournamentId,
    );
  }
}
