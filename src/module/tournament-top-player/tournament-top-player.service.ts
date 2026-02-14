import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TournamentTopPlayer } from '../../db/entities/tournament-top-player.entity';
import { TournamentTopPlayerPokemon } from '../../db/entities/tournament-top-player-pokemon.entity';
import { CreateTournamentTopPlayerDto } from './dto/create-tournament-top-player.dto';
import { Tournaments } from '../../db/entities/tournaments.entity';
import { Pokemon } from '../../db/entities/list-pokemons.entity';
import { CreateTournamentTopDto } from './dto/create-tournament-top.dto';

@Injectable()
export class TournamentTopPlayerService {
  constructor(
    @InjectRepository(TournamentTopPlayer)
    private readonly topPlayerRepo: Repository<TournamentTopPlayer>,

    @InjectRepository(TournamentTopPlayerPokemon)
    private readonly topPlayerPokemonRepo: Repository<TournamentTopPlayerPokemon>,

    @InjectRepository(Tournaments)
    private readonly tournamentRepo: Repository<Tournaments>,

    @InjectRepository(Pokemon)
    private readonly pokemonRepo: Repository<Pokemon>,
  ) {}

  // ===============================
  // Crear jugador Top
  // ===============================
  async create(
    dto: CreateTournamentTopPlayerDto,
  ): Promise<TournamentTopPlayer> {
    const {
      tournamentId,
      position,
      firstName,
      lastName,
      pokemons,
    } = dto;

    // 1️⃣ Validar torneo
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado');
    }

    // 2️⃣ Validar posición única
    const positionExists = await this.topPlayerRepo.findOne({
      where: { tournamentId, position },
    });

    if (positionExists) {
      throw new BadRequestException(
        `La posición ${position} ya existe en este torneo`,
      );
    }

    console.log(pokemons);

    // 3️⃣ Validar cantidad Pokémon
    if (pokemons.length !== 6) {
      throw new BadRequestException(
        'El jugador debe tener exactamente 6 Pokémon',
      );
    }

    // 4️⃣ Validar Pokémon existentes
    const pokemonIds = pokemons.map((p) => p.pokemonId);
    const existingPokemons = await this.pokemonRepo.findByIds(pokemonIds);

    if (existingPokemons.length !== 6) {
      throw new BadRequestException(
        'Uno o más Pokémon no existen',
      );
    }

    // 5️⃣ Crear jugador Top
    const topPlayer = this.topPlayerRepo.create({
      tournamentId,
      position,
      firstName,
      lastName,
    });

    const savedTopPlayer = await this.topPlayerRepo.save(topPlayer);

    // 6️⃣ Crear relación Pokémon
    const topPlayerPokemons = pokemons.map((p) =>
      this.topPlayerPokemonRepo.create({
        topPlayerId: savedTopPlayer.id,
        pokemonId: p.pokemonId,
        slot: p.slot,
      }),
    );

    await this.topPlayerPokemonRepo.save(topPlayerPokemons);

    // 7️⃣ Retornar jugador completo
    return this.topPlayerRepo.findOne({
      where: { id: savedTopPlayer.id },
      relations: ['pokemons', 'pokemons.pokemon'],
    });
  }

  // ===============================
  // Obtener Top por torneo
  // ===============================
  async findByTournament(
    tournamentId: number,
  ): Promise<TournamentTopPlayer[]> {
    console.log('(S)Obteniendo tops para el torneo ID:', tournamentId);

    return this.topPlayerRepo.find({
      where: { tournamentId },
      relations: [
        'tournament',
        'pokemons',
        'pokemons.pokemon',
      ],
      order: {
        position: 'ASC',
        pokemons: {
          slot: 'ASC',
        },
      },
    });
  }



  async createTop(dto: CreateTournamentTopDto) {
    const { tournamentId, players, formatoTorneo } = dto;
    let position = 1;

    for (const player of players) {
      // 1️⃣ Resolver Pokémon por nombre
      const pokemons = await this.pokemonRepo.find({
        where: player.pokemons.map((name) => ({ name })),
      });

      switch (formatoTorneo) {
        case 'vgc':
          if (pokemons.length < 4 || pokemons.length > 6) {
            throw new BadRequestException(
              `Formato VG permite entre 4 y 6 Pokémon para ${player.name} ${player.lastName}`,
            );
          }
          break;

        case 'tcg':
          if (pokemons.length < 1) {
            throw new BadRequestException(
              `Formato TCG requiere al menos 1 Pokémon para ${player.name} ${player.lastName}`,
            );
          }
          break;

        default:
          throw new BadRequestException('Formato de torneo no soportado');
      }

      // 2️⃣ Crear jugador top
      const topPlayer = await this.topPlayerRepo.save({
        tournamentId,
        position,
        firstName: player.name,
        lastName: player.lastName,
      });

      // 3️⃣ Relación Pokémon
      const relations = pokemons.map((pokemon, index) =>
        this.topPlayerPokemonRepo.create({
          topPlayerId: topPlayer.id,
          pokemonId: pokemon.id,
          slot: index + 1,
        }),
      );

      await this.topPlayerPokemonRepo.save(relations);

      position++;
    }

    return { message: 'Top registrado correctamente' };
  }

}
