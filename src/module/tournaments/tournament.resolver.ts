import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreateTournamentDto } from "./dto/create-tournament.dto";
import { TournamentsService } from "./tournaments.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class TournamentResolver {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly logger: MyLoggerService
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<any> {
    this.logger.log('(R) Creating tournament', TournamentResolver.name);

    let salida = [];

    this.logger.verbose('Creating tournament', TournamentResolver.name);

    const torneo = await this.tournamentsService.create(createTournamentDto);

    salida = [{
      message: 'Torneo creado correctamente',
      status: 'success',
      code: 200,
      torneo: torneo
    }];

    return salida;
  }

  async getTournamentsByUser(id: number): Promise<any> {
    this.logger.log('(R) Getting tournaments by user id '+id, TournamentResolver.name);

    const torneos = await this.tournamentsService.getTournamentsByUser(id);

    let salida = [{
      message: 'Torneos obtenidos correctamente',
      status: 'success',
      code: 200,
      datos: torneos
    }];


    return salida;
  }

}