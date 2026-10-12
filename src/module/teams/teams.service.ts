import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Teams } from '../../db/entities/team.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { SubFormat } from '../../db/entities/subFormat.entity';
import axios from 'axios';
import * as qs from 'qs';

import { VisionService } from '../vision/vision.service';
import { DetectedCard, ParserService } from '../parser/parser.service';

type ImageKind = 'info' | 'stats' | 'unknown';

interface ImageClassification {
  kind: ImageKind;
  statsMarkerCount: number;
  uniqueStatsMarkers: number;
  numericCount: number;
  textLength: number;
}

interface TeamValidationResult {
  validInfoSlots: number;
  validStatsSlots: number;
  completeSlots: number;
  warnings: string[];
}

interface ProcessedTeamImage {
  file: Express.Multer.File;
  result: any;
  size: {
    width: number;
    height: number;
  };
  classification: ImageClassification;
  cards: DetectedCard[];
}

interface ResolvedImagePair {
  info: ProcessedTeamImage;
  stats: ProcessedTeamImage;
  imagesSwapped: boolean;
}

@Injectable()
export class TeamsService {

  constructor(
    @InjectRepository(Teams)
    private readonly teamRepository: Repository<Teams>,
    private readonly logger: MyLoggerService,
    @InjectRepository(SubFormat)
    private readonly subformatRepository: Repository<SubFormat>,
    private readonly visionService: VisionService,
    private readonly parserService: ParserService,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    this.logger.log('(S) Creating team: ', TeamsService.name);
    
    let location = null;
    if(createTeamDto.urlPaste == '' || createTeamDto.urlPaste == null){
      
      //console.log(createTeamDto.rawInput);

      const response = await axios.post(
        'https://pokepast.es/create',
        qs.stringify({
          paste: createTeamDto.rawInput,
          title: createTeamDto.teamName,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          maxRedirects: 0, // 🔥 clave
          validateStatus: status => status === 302 || status === 303,
        }
      );

      location = response.headers.location;

    }

    createTeamDto.urlPaste = location ? `https://pokepast.es${location}` : createTeamDto.urlPaste;

    const { subFormatId, ...teamData } = createTeamDto;

    // Busca el subformato y asegúrate de que existe
    const subformat = await this.subformatRepository.findOne({ where: { id: createTeamDto['subFormatId'] } });
    if (!subformat) {
      throw new NotFoundException('Subformat not found');
    }
    const team = this.teamRepository.create({
      ...teamData,
      subformat,
    });

    //this.getallTeamsUpdate();

    return this.teamRepository.save(team);
  }

  async findAll() {
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return this.teamRepository.find({ where: { isPublic: true }});
  }

  async findAllJoin() {
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return this.teamRepository
      .createQueryBuilder('t')                  // Alias 't' para la tabla teams
      .innerJoinAndSelect('t.subformat', 's')   // INNER JOIN con la tabla subformats
      .where('t.is_public = :isPublic', { isPublic: true }) // Filtro para is_public = true
      .andWhere('t.sub_format_id > 6') // Filtro traer las últmas regulaciones
      .orderBy('t.id', 'DESC')
      .getMany();                               // Devuelve los resultados
  }

  async findAllHome(){
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return this.teamRepository.find({where: { isPublic: true }, order: { id: 'desc' }});
  }

  async findAllHomeJoin(){
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return this.teamRepository
      .createQueryBuilder('t')                  // Alias 't' para la tabla teams
      .innerJoinAndSelect('t.subformat', 's')   // INNER JOIN con la tabla subformats
      .where('t.is_public = :isPublic', { isPublic: true }) // Filtro para is_public = true
      .orderBy('t.id', 'DESC')
      .limit(20) // Limitar a los 20 equipos más recientes
      .getMany();                               // Devuelve los resultados
  }

  async findOne(id: number) {
    this.logger.log('(S) Getting team by id: '+id, TeamsService.name);
    return this.teamRepository.findOne({ where: { id } });
  }

  async findOneJoin(id: number) {
    this.logger.log('(S) Getting team by id: '+id, TeamsService.name);
    return this.teamRepository
      .createQueryBuilder('t')                  // Alias 't' para la tabla teams
      .innerJoinAndSelect('t.subformat', 's')   // INNER JOIN con la tabla subformats
      .where('t.id = :id', { id }) // Filtro para is_public = true
      .getOne();                               // Devuelve los resultados
  }

  async findTeamsByUser(userId: number) {
    this.logger.log('(S) Getting teams by user id: '+userId, TeamsService.name);
    return this.teamRepository.find({ where: { userId } });
  }

  async findTeamsByUserJoin(userId: number) {
    this.logger.log('(S) Getting teams by user id: '+userId, TeamsService.name);
    return this.teamRepository
      .createQueryBuilder('t')                  // Alias 't' para la tabla teams
      .innerJoinAndSelect('t.subformat', 's')   // INNER JOIN con la tabla subformats
      .where('t.user_id = :userId', { userId }) // Filtro para is_public = true
      .orderBy('t.id', 'DESC')
      .getMany();                               // Devuelve los resultados
  }

  async findOneByName(name: string) {
    this.logger.log('(S) Getting team by name: '+name, TeamsService.name);
    return this.teamRepository.findOne({ where: { teamName: name } });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    this.logger.log('(S) Updating team: '+id, TeamsService.name);
    return this.teamRepository.update(id, updateTeamDto);
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }

  async getallTeamsUpdate() {
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return await this.teamRepository
    .createQueryBuilder('team')
    .where('team.poke1 IS NULL ')
    .orderBy('team.date_created', 'DESC')
    .getMany();
    //return this.teamRepository.find();
  }

  async updateTeamPokes(teamId: number, ...pokes: (string | null)[]): Promise<void> {
    this.logger.log('(S) Updating team pokes: ' + teamId, TeamsService.name);

    const padded = Array.from({ length: 6 }, (_, i) => pokes[i] ?? null);

    await this.teamRepository
      .createQueryBuilder()
      .update(Teams)
      .set({
        poke1: padded[0],
        poke2: padded[1],
        poke3: padded[2],
        poke4: padded[3],
        poke5: padded[4],
        poke6: padded[5],
      })
      .where('id = :id', { id: teamId })
      .execute();
  }

  async findByUrlPaste(urlPaste: string) {
    return this.teamRepository.findOne({ where: { urlPaste } });
  }

  async findAllUrlPastes(): Promise<string[]> {
    const teams = await this.teamRepository.find({
      select: ['urlPaste'],
    });

    return teams.map((t) => t.urlPaste);
  }

  async readImages(
    firstImage: Express.Multer.File,
    secondImage: Express.Multer.File,
  ) {
    if (!firstImage?.buffer || !secondImage?.buffer) {
      throw new BadRequestException({
        status: 'error',
        code: 'IMAGES_REQUIRED',
        message:
          'Debes subir la imagen de Datos varios y la imagen de Características.',
      });
    }

    const [
      firstResult,
      secondResult,
      firstSize,
      secondSize,
      firstCards,
      secondCards,
    ] = await Promise.all([
      this.visionService.detectText(firstImage.buffer),
      this.visionService.detectText(secondImage.buffer),
      this.parserService.getImageSize(firstImage.buffer),
      this.parserService.getImageSize(secondImage.buffer),
      this.parserService.detectCards(firstImage.buffer),
      this.parserService.detectCards(secondImage.buffer),
    ]);

    const firstProcessed: ProcessedTeamImage = {
      file: firstImage,
      result: firstResult,
      size: firstSize,
      classification: this.classifyImage(firstResult),
      cards: firstCards,
    };

    const secondProcessed: ProcessedTeamImage = {
      file: secondImage,
      result: secondResult,
      size: secondSize,
      classification: this.classifyImage(secondResult),
      cards: secondCards,
    };

    this.completeImageClassification(firstProcessed);
    this.completeImageClassification(secondProcessed);

    /*
     * El orden ya no es obligatorio. La imagen de estadísticas se identifica
     * por sus etiquetas y, como respaldo, por la cantidad de filas numéricas.
     */
    const imagePair = this.resolveImagePair(
      firstProcessed,
      secondProcessed,
    );

    let infoWords = this.parserService.extractWords(imagePair.info.result);
    let statsWords = this.parserService.extractWords(imagePair.stats.result);

    const initialInfoPokemon = this.parserService.parseInfo(
      infoWords,
      imagePair.info.size,
      imagePair.info.cards,
    );

    const initialStatsPokemon = this.parserService.parseStats(
      statsWords,
      imagePair.stats.size,
      imagePair.stats.cards,
    );

    const weakInfoSlots = this.getWeakInfoSlots(initialInfoPokemon);
    const weakStatsSlots = this.getWeakStatsSlots(initialStatsPokemon);

    let infoPokemon = initialInfoPokemon;
    let statsPokemon = initialStatsPokemon;

    /*
     * OCR de respaldo por tarjeta. Solo se ejecuta para slots incompletos, por
     * lo que una imagen que ya fue leída correctamente no genera llamadas extra.
     */
    if (weakInfoSlots.length) {
      const regions = this.parserService.getOcrRegions(
        imagePair.info.cards,
        imagePair.info.size,
        weakInfoSlots,
      );

      const regionResults = await this.visionService.detectTextRegions(
        imagePair.info.file.buffer,
        regions,
      );

      const mappedWords = regionResults.flatMap((result) =>
        this.parserService.extractMappedRegionWords(result),
      );

      infoWords = this.parserService.replaceWordsInRegions(
        infoWords,
        regions,
        mappedWords,
      );

      const reparsed = this.parserService.parseInfo(
        infoWords,
        imagePair.info.size,
        imagePair.info.cards,
      );

      infoPokemon = this.selectBestInfoBySlot(initialInfoPokemon, reparsed);
    }

    if (weakStatsSlots.length) {
      const regions = this.parserService.getOcrRegions(
        imagePair.stats.cards,
        imagePair.stats.size,
        weakStatsSlots,
      );

      const regionResults = await this.visionService.detectTextRegions(
        imagePair.stats.file.buffer,
        regions,
      );

      const mappedWords = regionResults.flatMap((result) =>
        this.parserService.extractMappedRegionWords(result),
      );

      statsWords = this.parserService.replaceWordsInRegions(
        statsWords,
        regions,
        mappedWords,
      );

      const reparsed = this.parserService.parseStats(
        statsWords,
        imagePair.stats.size,
        imagePair.stats.cards,
      );

      statsPokemon = this.selectBestStatsBySlot(initialStatsPokemon, reparsed);
    }

    const parsedValidation = this.validateParsedTeam(
      infoPokemon,
      statsPokemon,
    );

    const natures = await this.parserService.detectNatures(
      imagePair.stats.file.buffer,
      imagePair.stats.cards,
      statsWords,
    );

    const pokemon = this.parserService.mergePokemon(
      infoPokemon,
      statsPokemon,
      natures,
      50,
    );

    const warnings = [...parsedValidation.warnings];

    if (imagePair.imagesSwapped) {
      warnings.unshift(
        'Las imágenes venían invertidas y fueron reordenadas automáticamente.',
      );
    }

    //aca registrar en BBDD el user que subio el team

    return {
      status: 'success',
      pokemon,
      showdown: this.parserService.formatShowdown(pokemon),
      warnings,
      validation: {
        infoImage: imagePair.info.classification,
        statsImage: imagePair.stats.classification,
        imagesSwapped: imagePair.imagesSwapped,
        infoCardDetection: this.getCardDetectionSummary(imagePair.info.cards),
        statsCardDetection: this.getCardDetectionSummary(imagePair.stats.cards),
        regionalInfoOcrSlots: weakInfoSlots,
        regionalStatsOcrSlots: weakStatsSlots,
        validInfoSlots: parsedValidation.validInfoSlots,
        validStatsSlots: parsedValidation.validStatsSlots,
        completeSlots: parsedValidation.completeSlots,
        warnings,
      },
    };
  }

  private completeImageClassification(image: ProcessedTeamImage): void {
    if (image.classification.kind === 'stats') {
      return;
    }

    const words = this.parserService.extractWords(image.result);
    const parsedStats = this.parserService.parseStats(
      words,
      image.size,
      image.cards,
    );

    const statValueCount = parsedStats.reduce(
      (total, pokemon) =>
        total +
        ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].filter(
          (key) => Number(pokemon?.stats?.[key]) > 0,
        ).length,
      0,
    );

    if (statValueCount >= 18) {
      image.classification.kind = 'stats';
      return;
    }

    if (
      image.classification.kind === 'unknown' &&
      image.cards.length === 6 &&
      words.length >= 12
    ) {
      image.classification.kind = 'info';
    }
  }

  private getWeakInfoSlots(pokemon: any[]): number[] {
    return pokemon
      .filter((entry) => {
        const moveCount = Array.isArray(entry?.moves)
          ? entry.moves.filter((move: unknown) => this.hasText(move)).length
          : 0;

        return (
          !this.hasText(entry?.nickname || entry?.name || entry?.species) ||
          !this.hasText(entry?.ability) ||
          !this.hasText(entry?.item) ||
          moveCount < 4
        );
      })
      .map((entry) => Number(entry.slot))
      .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= 6);
  }

  private getWeakStatsSlots(pokemon: any[]): number[] {
    return pokemon
      .filter((entry) => {
        const statCount = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].filter(
          (key) => Number(entry?.stats?.[key]) > 0,
        ).length;

        return statCount < 6;
      })
      .map((entry) => Number(entry.slot))
      .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= 6);
  }

  private selectBestInfoBySlot(initial: any[], reparsed: any[]): any[] {
    const reparsedBySlot = new Map(
      reparsed.map((pokemon) => [pokemon.slot, pokemon]),
    );

    return initial.map((pokemon) => {
      const candidate = reparsedBySlot.get(pokemon.slot);

      return this.scoreInfoPokemon(candidate) >= this.scoreInfoPokemon(pokemon)
        ? candidate
        : pokemon;
    });
  }

  private selectBestStatsBySlot(initial: any[], reparsed: any[]): any[] {
    const reparsedBySlot = new Map(
      reparsed.map((pokemon) => [pokemon.slot, pokemon]),
    );

    return initial.map((pokemon) => {
      const candidate = reparsedBySlot.get(pokemon.slot);

      return this.scoreStatsPokemon(candidate) >= this.scoreStatsPokemon(pokemon)
        ? candidate
        : pokemon;
    });
  }

  private scoreInfoPokemon(pokemon: any): number {
    if (!pokemon) {
      return -1;
    }

    const moves = Array.isArray(pokemon.moves)
      ? pokemon.moves.filter((move: unknown) => this.hasText(move)).length
      : 0;

    return (
      (this.hasText(pokemon.nickname || pokemon.name || pokemon.species) ? 8 : 0) +
      (this.hasText(pokemon.ability) ? 3 : 0) +
      (this.hasText(pokemon.item) ? 3 : 0) +
      moves * 4
    );
  }

  private scoreStatsPokemon(pokemon: any): number {
    if (!pokemon) {
      return -1;
    }

    return ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].filter(
      (key) => Number(pokemon?.stats?.[key]) > 0,
    ).length;
  }

  private getCardDetectionSummary(cards: DetectedCard[]) {
    return {
      source: cards.every((card) => card.source === 'pixel')
        ? 'pixel'
        : 'fallback',
      detectedSlots: cards.map((card) => card.slot).sort((a, b) => a - b),
      cards,
    };
  }

  private resolveImagePair(
    first: ProcessedTeamImage,
    second: ProcessedTeamImage,
  ): ResolvedImagePair {
    const firstKind = first.classification.kind;
    const secondKind = second.classification.kind;

    if (firstKind === 'stats' && secondKind === 'stats') {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INVALID_IMAGE_PAIR',
        message:
          'Las dos imágenes parecen corresponder a Características. Debes subir una imagen de Datos varios y otra de Características.',
        validation: {
          firstImage: first.classification,
          secondImage: second.classification,
        },
      });
    }

    if (firstKind !== 'stats' && secondKind !== 'stats') {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INVALID_STATS_IMAGE',
        message:
          'No fue posible identificar la imagen de la pantalla Características.',
        validation: {
          firstImage: first.classification,
          secondImage: second.classification,
        },
      });
    }

    if (firstKind === 'stats') {
      if (secondKind === 'unknown' && second.cards.length !== 6) {
        throw new UnprocessableEntityException({
          status: 'error',
          code: 'INVALID_INFO_IMAGE',
          message:
            'La otra imagen no contiene información suficiente de la pantalla Datos varios.',
          validation: {
            firstImage: first.classification,
            secondImage: second.classification,
          },
        });
      }

      return {
        info: second,
        stats: first,
        imagesSwapped: true,
      };
    }

    if (firstKind === 'unknown' && first.cards.length !== 6) {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INVALID_INFO_IMAGE',
        message:
          'La otra imagen no contiene información suficiente de la pantalla Datos varios.',
        validation: {
          firstImage: first.classification,
          secondImage: second.classification,
        },
      });
    }

    return {
      info: first,
      stats: second,
      imagesSwapped: false,
    };
  }

  private classifyImage(result: any): ImageClassification {
    const text = this.normalizeOcrText(
      result?.fullTextAnnotation?.text || '',
    );

    /*
    * Estos textos solamente se utilizan para reconocer
    * el tipo de pantalla. No se traducen los datos del equipo.
    */
    const markerGroups: RegExp[][] = [
      // HP
      [
        /\bps\b/g,
        /\bhp\b/g,
        /\bpv\b/g,
        /\bkp\b/g,
      ],

      // Ataque
      [
        /\bataque\b/g,
        /\battack\b/g,
        /\battaque\b/g,
        /\bangriff\b/g,
        /\battacco\b/g,
      ],

      // Defensa
      [
        /\bdefensa\b/g,
        /\bdefense\b/g,
        /\bdefence\b/g,
        /\bverteidigung\b/g,
        /\bdifesa\b/g,
      ],

      // Ataque especial
      [
        /\bat esp\b/g,
        /\bsp atk\b/g,
        /\bspecial attack\b/g,
        /\batq spe\b/g,
        /\battaque spe\b/g,
        /\bsp ang\b/g,
        /\bspezial angriff\b/g,
        /\batt sp\b/g,
      ],

      // Defensa especial
      [
        /\bdef esp\b/g,
        /\bsp def\b/g,
        /\bspecial defense\b/g,
        /\bspecial defence\b/g,
        /\bdef spe\b/g,
        /\bdefense spe\b/g,
        /\bsp vert\b/g,
        /\bspezial verteidigung\b/g,
        /\bdif sp\b/g,
      ],

      // Velocidad
      [
        /\bvelocidad\b/g,
        /\bspeed\b/g,
        /\bvitesse\b/g,
        /\binitiative\b/g,
        /\bvelocita\b/g,
      ],
    ];

    const markerMatches = markerGroups.map((patterns) =>
      patterns.reduce(
        (groupTotal, pattern) =>
          groupTotal + (text.match(pattern)?.length || 0),
        0,
      ),
    );

    const statsMarkerCount = markerMatches.reduce(
      (total, count) => total + count,
      0,
    );

    const uniqueStatsMarkers = markerMatches.filter(
      (count) => count > 0,
    ).length;

    const numericCount =
      text.match(/\b\d{1,3}\b/g)?.length || 0;

    const textLength =
      text.replace(/\s+/g, '').length;

    const looksLikeStats =
      uniqueStatsMarkers >= 4 &&
      statsMarkerCount >= 8 &&
      numericCount >= 12;

    let kind: ImageKind = 'unknown';

    if (looksLikeStats) {
      kind = 'stats';
    } else if (textLength >= 30) {
      kind = 'info';
    }

    return {
      kind,
      statsMarkerCount,
      uniqueStatsMarkers,
      numericCount,
      textLength,
    };
  }

  private validateParsedTeam(
    infoPokemon: any[],
    statsPokemon: any[],
  ): TeamValidationResult {
    const validInfoSlots = infoPokemon.filter((pokemon) => {
      const name = this.hasText(
        pokemon?.nickname || pokemon?.name || pokemon?.species,
      );

      const moveCount = Array.isArray(pokemon?.moves)
        ? pokemon.moves.filter((move: unknown) => this.hasText(move)).length
        : 0;

      const hasDetail =
        this.hasText(pokemon?.ability) ||
        this.hasText(pokemon?.item);

      return name && moveCount >= 2 && hasDetail;
    }).length;

    const validStatsSlots = statsPokemon.filter((pokemon) => {
      const stats = pokemon?.stats || {};

      const count = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].filter(
        (key) => {
          const value = Number(stats[key]);
          return Number.isFinite(value) && value > 0;
        },
      ).length;

      return count >= 4;
    }).length;

    const infoBySlot = new Map(
      infoPokemon.map((pokemon) => [pokemon.slot, pokemon]),
    );

    const statsBySlot = new Map(
      statsPokemon.map((pokemon) => [pokemon.slot, pokemon]),
    );

    let completeSlots = 0;

    for (let slot = 1; slot <= 6; slot += 1) {
      const info = infoBySlot.get(slot);
      const stats = statsBySlot.get(slot);

      const hasName = this.hasText(
        info?.nickname || info?.name || info?.species,
      );

      const moveCount = Array.isArray(info?.moves)
        ? info.moves.filter((move: unknown) => this.hasText(move)).length
        : 0;

      const statCount = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].filter(
        (key) => Number(stats?.stats?.[key]) > 0,
      ).length;

      if (hasName && moveCount >= 2 && statCount >= 4) {
        completeSlots += 1;
      }
    }

    if (validInfoSlots < 3) {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INVALID_INFO_IMAGE',
        message:
          'No fue posible leer suficiente información de nombres, habilidades, objetos y movimientos en la primera imagen.',
        validation: {
          validInfoSlots,
          validStatsSlots,
          completeSlots,
        },
      });
    }

    if (validStatsSlots < 3) {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INVALID_STATS_IMAGE',
        message:
          'No fue posible leer suficientes estadísticas en la segunda imagen.',
        validation: {
          validInfoSlots,
          validStatsSlots,
          completeSlots,
        },
      });
    }

    if (completeSlots < 3) {
      throw new UnprocessableEntityException({
        status: 'error',
        code: 'INSUFFICIENT_TEAM_DATA',
        message:
          'Las imágenes fueron reconocidas, pero no contienen suficiente información para completar el equipo.',
        validation: {
          validInfoSlots,
          validStatsSlots,
          completeSlots,
        },
      });
    }

    const warnings: string[] = [];

    if (completeSlots < 6) {
      warnings.push(
        `Se detectaron ${completeSlots} de 6 Pokémon con información suficientemente completa.`,
      );
    }

    if (validInfoSlots < 6) {
      warnings.push(
        'Algunos nombres, habilidades, objetos o movimientos podrían estar incompletos.',
      );
    }

    if (validStatsSlots < 6) {
      warnings.push(
        'Algunas estadísticas podrían estar incompletas o no haber sido reconocidas.',
      );
    }

    return {
      validInfoSlots,
      validStatsSlots,
      completeSlots,
      warnings,
    };
  }

  private normalizeOcrText(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private hasText(value: unknown): boolean {
    return String(value || '').trim().length >= 2;
  }

}
