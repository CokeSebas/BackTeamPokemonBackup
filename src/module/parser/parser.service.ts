import { Injectable } from '@nestjs/common';
const sharp = require('sharp');

import {
  ImageSize,
  PokemonInfo,
  PokemonStatKey,
  PokemonStatsResult,
  VisionLine,
  VisionWord,
} from './interfaces/parser.types';

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface DetectedCard extends Rect {
  slot: number;
  source: 'pixel' | 'fallback';
}

export interface OcrRegion extends Rect {
  slot: number;
}

export interface RegionalOcrResult {
  region: OcrRegion;
  result: any;
  outputWidth: number;
  outputHeight: number;
}

export type CardLayoutName = 'compact' | 'standard';

interface CardRect extends Rect {
  slot: number;
}

interface RowSegment {
  centerY: number;
  segments: VisionLine[];
}

interface MaskBand {
  start: number;
  end: number;
  score: number;
}

interface PixelBuffer {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

/**
 * Solo se utilizan como respaldo cuando la detección visual no logra encontrar
 * las seis tarjetas. El flujo normal trabaja con las posiciones detectadas en
 * la imagen y no con coordenadas rígidas.
 */
const FALLBACK_LAYOUTS: Record<CardLayoutName, CardRect[]> = {
  compact: [
    { slot: 1, left: 180, right: 940, top: 230, bottom: 430 },
    { slot: 2, left: 985, right: 1740, top: 230, bottom: 430 },
    { slot: 3, left: 180, right: 940, top: 450, bottom: 650 },
    { slot: 4, left: 985, right: 1740, top: 450, bottom: 650 },
    { slot: 5, left: 180, right: 940, top: 670, bottom: 870 },
    { slot: 6, left: 985, right: 1740, top: 670, bottom: 870 },
  ],
  standard: [
    { slot: 1, left: 180, right: 940, top: 270, bottom: 470 },
    { slot: 2, left: 985, right: 1740, top: 270, bottom: 470 },
    { slot: 3, left: 180, right: 940, top: 490, bottom: 690 },
    { slot: 4, left: 985, right: 1740, top: 490, bottom: 690 },
    { slot: 5, left: 180, right: 940, top: 710, bottom: 910 },
    { slot: 6, left: 985, right: 1740, top: 710, bottom: 910 },
  ],
};

const STAT_ORDER: PokemonStatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

const STAT_LABELS: Record<PokemonStatKey, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

const NATURES: Record<string, string> = {
  'atk:def': 'Huraña',
  'atk:spa': 'Firme',
  'atk:spd': 'Pícara',
  'atk:spe': 'Audaz',

  'def:atk': 'Osada',
  'def:spa': 'Agitada',
  'def:spd': 'Floja',
  'def:spe': 'Plácida',

  'spa:atk': 'Modesta',
  'spa:def': 'Afable',
  'spa:spd': 'Alocada',
  'spa:spe': 'Mansa',

  'spd:atk': 'Serena',
  'spd:def': 'Amable',
  'spd:spa': 'Cauta',
  'spd:spe': 'Grosera',

  'spe:atk': 'Miedosa',
  'spe:def': 'Activa',
  'spe:spa': 'Alegre',
  'spe:spd': 'Ingenua',
};

@Injectable()
export class ParserService {
  async getImageSize(image: Buffer): Promise<ImageSize> {
    const metadata = await sharp(image).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('No fue posible obtener las dimensiones de la imagen');
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  }

  /**
   * Localiza las seis tarjetas por color y densidad horizontal.
   *
   * Esto reemplaza la dependencia principal de coordenadas fijas y permite
   * soportar capturas 16:9, ultrawide, redimensionadas y recomprimidas.
   */
  async detectCards(
    image: Buffer,
    suppliedSize?: ImageSize,
  ): Promise<DetectedCard[]> {
    const originalSize = suppliedSize ?? (await this.getImageSize(image));
    const analysisWidth = Math.min(640, originalSize.width);

    const { data, info } = await sharp(image)
      .resize({
        width: analysisWidth,
        withoutEnlargement: true,
        kernel: 'lanczos3',
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const mask = this.createPurpleMask({
      data,
      width: info.width,
      height: info.height,
      channels: info.channels,
    });

    const detected = this.detectCardsFromMask(
      mask,
      info.width,
      info.height,
      originalSize,
    );

    if (this.isValidCardSet(detected, originalSize)) {
      return detected.sort((a, b) => a.slot - b.slot);
    }

    return this.getFallbackCards(originalSize);
  }

  /**
   * Regiones que se pueden volver a enviar a OCR cuando una tarjeta quedó
   * incompleta. Se agrega un margen pequeño para incluir nombres y sombras.
   */
  getOcrRegions(
    cards: DetectedCard[],
    size: ImageSize,
    slots?: number[],
  ): OcrRegion[] {
    const requestedSlots = slots?.length ? new Set(slots) : undefined;

    return cards
      .filter((card) => !requestedSlots || requestedSlots.has(card.slot))
      .map((card) => {
        const width = card.right - card.left;
        const height = card.bottom - card.top;

        return {
          slot: card.slot,
          left: this.clamp(Math.round(card.left - width * 0.025), 0, size.width - 1),
          top: this.clamp(Math.round(card.top - height * 0.06), 0, size.height - 1),
          right: this.clamp(Math.round(card.right + width * 0.015), 1, size.width),
          bottom: this.clamp(Math.round(card.bottom + height * 0.04), 1, size.height),
        };
      });
  }

  /**
   * Convierte las coordenadas de un OCR ejecutado sobre un recorte escalado
   * nuevamente a coordenadas de la imagen original.
   */
  extractMappedRegionWords(payload: RegionalOcrResult): VisionWord[] {
    const localWords = this.extractWords(payload.result);
    const regionWidth = payload.region.right - payload.region.left;
    const regionHeight = payload.region.bottom - payload.region.top;
    const scaleX = regionWidth / Math.max(1, payload.outputWidth);
    const scaleY = regionHeight / Math.max(1, payload.outputHeight);

    return localWords.map((word) => {
      const left = payload.region.left + word.left * scaleX;
      const right = payload.region.left + word.right * scaleX;
      const top = payload.region.top + word.top * scaleY;
      const bottom = payload.region.top + word.bottom * scaleY;

      return {
        ...word,
        left,
        right,
        top,
        bottom,
        centerX: (left + right) / 2,
        centerY: (top + bottom) / 2,
      };
    });
  }

  /**
   * Sustituye las palabras del OCR general únicamente dentro de los recortes
   * reprocesados. Así se evita duplicar líneas.
   */
  replaceWordsInRegions(
    baseWords: VisionWord[],
    regions: OcrRegion[],
    replacementWords: VisionWord[],
  ): VisionWord[] {
    const outsideRegions = baseWords.filter(
      (word) => !regions.some((region) => this.pointInRect(word.centerX, word.centerY, region)),
    );

    return this.deduplicateWords([...outsideRegions, ...replacementWords]);
  }

  /**
   * Convierte la respuesta de Google Vision en palabras y conserva las
   * coordenadas de cada bounding box.
   */
  extractWords(result: any): VisionWord[] {
    const words: VisionWord[] = [];
    const pages = result?.fullTextAnnotation?.pages ?? [];

    for (const page of pages) {
      for (const block of page.blocks ?? []) {
        for (const paragraph of block.paragraphs ?? []) {
          for (const word of paragraph.words ?? []) {
            const text = (word.symbols ?? [])
              .map((symbol: any) => symbol.text ?? '')
              .join('');

            const vertices = word.boundingBox?.vertices ?? [];
            const xs = vertices.map((vertex: any) => vertex.x ?? 0);
            const ys = vertices.map((vertex: any) => vertex.y ?? 0);

            if (!xs.length || !ys.length || !text.trim()) {
              continue;
            }

            const left = Math.min(...xs);
            const right = Math.max(...xs);
            const top = Math.min(...ys);
            const bottom = Math.max(...ys);

            words.push({
              text,
              left,
              top,
              right,
              bottom,
              centerX: (left + right) / 2,
              centerY: (top + bottom) / 2,
              confidence: word.confidence ?? 1,
            });
          }
        }
      }
    }

    return words;
  }

  /** Agrupa palabras en líneas dentro de una región concreta. */
  buildLines(words: VisionWord[], tolerance = 10): VisionLine[] {
    const groups = this.groupWordsByRow(words, tolerance);

    return groups
      .map((group) => this.wordsToLine(group))
      .filter((line) => line.text.length > 0)
      .sort((a, b) => a.centerY - b.centerY);
  }

  /** Compatibilidad con el código anterior. */
  resolveInfoLayout(_words: VisionWord[], size: ImageSize): CardLayoutName {
    return this.getFallbackLayout(size);
  }

  /** Compatibilidad con el código anterior. */
  resolveStatsLayout(_words: VisionWord[], size: ImageSize): CardLayoutName {
    return this.getFallbackLayout(size);
  }

  parseInfo(
    words: VisionWord[],
    size: ImageSize,
    cardsOrLayout?: DetectedCard[] | CardLayoutName,
  ): PokemonInfo[] {
    const cards = this.resolveCards(size, cardsOrLayout);

    return cards.map((card) => this.parseInfoCard(words, size, card));
  }

  parseStats(
    words: VisionWord[],
    size: ImageSize,
    cardsOrLayout?: DetectedCard[] | CardLayoutName,
  ): PokemonStatsResult[] {
    const cards = this.resolveCards(size, cardsOrLayout);

    return cards.map((card) => ({
      slot: card.slot,
      stats: this.parseStatsCard(words, size, card),
    }));
  }

  /**
   * Detecta las flechas de naturaleza usando las tarjetas reales y, cuando se
   * dispone del OCR, la altura exacta de cada fila de estadística.
   */
  async detectNatures(
    image: Buffer,
    cardsOrLayout?: DetectedCard[] | CardLayoutName,
    statsWords: VisionWord[] = [],
  ): Promise<Record<number, string | undefined>> {
    const { data, info } = await sharp(image)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const size: ImageSize = { width: info.width, height: info.height };
    const cards = this.resolveCards(size, cardsOrLayout);
    const result: Record<number, string | undefined> = {};

    for (const card of cards) {
      const width = card.right - card.left;
      const height = card.bottom - card.top;
      const rowCenters = this.getStatRowCenters(statsWords, size, card);

      const regions: Array<{
        stat: Exclude<PokemonStatKey, 'hp'>;
        leftFraction: number;
        rightFraction: number;
        fallbackY: number;
      }> = [
        { stat: 'atk', leftFraction: 0.16, rightFraction: 0.29, fallbackY: 0.60 },
        { stat: 'def', leftFraction: 0.16, rightFraction: 0.29, fallbackY: 0.82 },
        { stat: 'spa', leftFraction: 0.61, rightFraction: 0.73, fallbackY: 0.38 },
        { stat: 'spd', leftFraction: 0.61, rightFraction: 0.73, fallbackY: 0.60 },
        { stat: 'spe', leftFraction: 0.61, rightFraction: 0.73, fallbackY: 0.82 },
      ];

      let increasedStat: Exclude<PokemonStatKey, 'hp'> | undefined;
      let decreasedStat: Exclude<PokemonStatKey, 'hp'> | undefined;
      let strongestIncrease = 0;
      let strongestDecrease = 0;

      for (const region of regions) {
        const centerY = rowCenters[region.stat] ?? card.top + height * region.fallbackY;
        const rect: Rect = {
          left: Math.round(card.left + width * region.leftFraction),
          right: Math.round(card.left + width * region.rightFraction),
          top: Math.round(centerY - height * 0.075),
          bottom: Math.round(centerY + height * 0.075),
        };

        const counts = this.countNaturePixels(
          data,
          info.width,
          info.height,
          info.channels,
          rect,
        );

        const minimumPixels = Math.max(
          5,
          Math.round((rect.right - rect.left) * (rect.bottom - rect.top) * 0.004),
        );

        if (
          counts.increasedPixels >= minimumPixels &&
          counts.increasedPixels > counts.decreasedPixels * 1.35 &&
          counts.increasedPixels > strongestIncrease
        ) {
          strongestIncrease = counts.increasedPixels;
          increasedStat = region.stat;
        }

        if (
          counts.decreasedPixels >= minimumPixels &&
          counts.decreasedPixels > counts.increasedPixels * 1.35 &&
          counts.decreasedPixels > strongestDecrease
        ) {
          strongestDecrease = counts.decreasedPixels;
          decreasedStat = region.stat;
        }
      }

      result[card.slot] =
        increasedStat && decreasedStat
          ? NATURES[`${increasedStat}:${decreasedStat}`]
          : undefined;
    }

    return result;
  }

  mergePokemon(
    infoPokemon: PokemonInfo[],
    statsPokemon: PokemonStatsResult[],
    natures: Record<number, string | undefined>,
    level = 50,
  ): PokemonInfo[] {
    const statsBySlot = new Map(
      statsPokemon.map((pokemon) => [pokemon.slot, pokemon]),
    );

    return infoPokemon.map((pokemon) => {
      const nickname = pokemon.nickname ?? `Slot ${pokemon.slot}`;

      return {
        ...pokemon,
        species: nickname,
        level,
        stats: statsBySlot.get(pokemon.slot)?.stats ?? {},
        nature: natures[pokemon.slot],
      };
    });
  }

  formatShowdown(team: PokemonInfo[]): string {
    return team
      .map((pokemon) => {
        const name = pokemon.species ?? pokemon.nickname ?? `Slot ${pokemon.slot}`;
        const title = pokemon.item ? `${name} @ ${pokemon.item}` : name;

        const statsText = STAT_ORDER.filter(
          (stat) => pokemon.stats[stat] !== undefined,
        )
          .map((stat) => `${pokemon.stats[stat]} ${STAT_LABELS[stat]}`)
          .join(' / ');

        return [
          title,
          pokemon.ability ? `Ability: ${pokemon.ability}` : undefined,
          pokemon.level !== undefined ? `Level: ${pokemon.level}` : undefined,
          statsText ? `EVs: ${statsText}` : undefined,
          pokemon.nature ? `${pokemon.nature} Nature` : undefined,
          ...pokemon.moves.map((move) => `- ${move}`),
        ]
          .filter((line): line is string => Boolean(line))
          .join('\n');
      })
      .join('\n\n');
  }

  private parseInfoCard(
    words: VisionWord[],
    size: ImageSize,
    card: DetectedCard,
  ): PokemonInfo {
    const width = card.right - card.left;
    const height = card.bottom - card.top;
    const region: Rect = {
      left: card.left + width * 0.015,
      right: card.right - width * 0.01,
      top: card.top - height * 0.035,
      bottom: card.bottom + height * 0.025,
    };

    const rows = this.buildSegmentRows(words, region, size, card);
    const usableRows = rows
      .map((row) => ({
        ...row,
        segments: row.segments
          .map((segment) => ({
            ...segment,
            text: this.cleanDetectedText(segment.text),
          }))
          .filter((segment) => this.isUsefulInfoText(segment.text)),
      }))
      .filter((row) => row.segments.length > 0);

    const leftLimit = card.left + width * 0.60;
    const nicknameRow = usableRows.find((row) =>
      row.segments.some((segment) => segment.centerX < leftLimit),
    );

    const nicknameSegment = nicknameRow?.segments
      .filter((segment) => segment.centerX < leftLimit)
      .sort((a, b) => a.left - b.left)[0];

    const nickname = nicknameSegment?.text;
    const detailCandidates: VisionLine[] = [];
    const moveCandidates: VisionLine[] = [];

    for (const row of usableRows) {
      const segments = [...row.segments].sort((a, b) => a.left - b.left);
      const withoutNickname = segments.filter(
        (segment) => segment !== nicknameSegment && !this.sameText(segment.text, nickname),
      );

      if (!withoutNickname.length) {
        continue;
      }

      const leftmost = withoutNickname[0];
      const rightmost = withoutNickname[withoutNickname.length - 1];
      const hasSeparatedColumns =
        withoutNickname.length >= 2 &&
        rightmost.left - leftmost.right > width * 0.055;

      if (
        hasSeparatedColumns &&
        rightmost.centerX > card.left + width * 0.40
      ) {
        moveCandidates.push(rightmost);

        for (const segment of withoutNickname.slice(0, -1)) {
          if (segment.centerX < card.left + width * 0.56) {
            detailCandidates.push(segment);
          }
        }

        continue;
      }

      for (const segment of withoutNickname) {
        if (segment.centerX >= card.left + width * 0.43) {
          moveCandidates.push(segment);
        } else if (segment.centerX < card.left + width * 0.56) {
          detailCandidates.push(segment);
        }
      }
    }

    const details = this.uniqueTextLines(
      detailCandidates
        .sort((a, b) => a.centerY - b.centerY)
        .map((segment) => segment.text)
        .filter((text) => !this.sameText(text, nickname)),
    ).slice(0, 2);

    const moves = this.uniqueTextLines(
      moveCandidates
        .sort((a, b) => a.centerY - b.centerY)
        .map((segment) => segment.text)
        .filter((text) => !this.sameText(text, nickname))
        .filter((text) => !details.some((detail) => this.sameText(text, detail))),
    ).slice(0, 4);

    return {
      slot: card.slot,
      nickname,
      ability: details[0],
      item: details[1],
      moves,
      stats: {},
    };
  }

  private parseStatsCard(
    words: VisionWord[],
    size: ImageSize,
    card: DetectedCard,
  ): Partial<Record<PokemonStatKey, number>> {
    const width = card.right - card.left;
    const height = card.bottom - card.top;
    const stats: Partial<Record<PokemonStatKey, number>> = {};

    const leftRect: Rect = {
      left: card.left + width * 0.05,
      right: card.left + width * 0.52,
      top: card.top + height * 0.16,
      bottom: card.bottom - height * 0.05,
    };

    const rightRect: Rect = {
      left: card.left + width * 0.48,
      right: card.right - width * 0.02,
      top: card.top + height * 0.16,
      bottom: card.bottom - height * 0.05,
    };

    this.assignStatsFromLines(
      stats,
      this.linesInRect(words, leftRect, size, height),
      ['hp', 'atk', 'def'],
    );

    this.assignStatsFromLines(
      stats,
      this.linesInRect(words, rightRect, size, height),
      ['spa', 'spd', 'spe'],
    );

    this.assignStatsFromNumericRows(
      stats,
      words,
      card,
      leftRect,
      ['hp', 'atk', 'def'],
    );

    this.assignStatsFromNumericRows(
      stats,
      words,
      card,
      rightRect,
      ['spa', 'spd', 'spe'],
    );

    return stats;
  }

  private buildSegmentRows(
    words: VisionWord[],
    rect: Rect,
    _size: ImageSize,
    card: DetectedCard,
  ): RowSegment[] {
    const cardWidth = card.right - card.left;
    const cardHeight = card.bottom - card.top;
    const rowTolerance = Math.max(5, Math.round(cardHeight * 0.055));
    const maximumNormalGap = Math.max(18, Math.round(cardWidth * 0.045));
    const groups = this.groupWordsByRow(this.wordsInRect(words, rect), rowTolerance);

    return groups
      .map((group) => {
        const ordered = [...group].sort((a, b) => a.left - b.left);
        const splitGroups: VisionWord[][] = [];

        for (const word of ordered) {
          const current = splitGroups[splitGroups.length - 1];
          const previous = current?.[current.length - 1];

          if (!current || (previous && word.left - previous.right > maximumNormalGap)) {
            splitGroups.push([word]);
          } else {
            current.push(word);
          }
        }

        const segments = splitGroups
          .map((segmentWords) => this.wordsToLine(segmentWords))
          .filter((segment) => segment.text.length > 0);

        return {
          centerY: this.averageCenterY(group),
          segments,
        };
      })
      .sort((a, b) => a.centerY - b.centerY);
  }

  private assignStatsFromLines(
    target: Partial<Record<PokemonStatKey, number>>,
    lines: VisionLine[],
    allowedStats: PokemonStatKey[],
  ): void {
    for (const line of lines) {
      const stat = this.detectStatKey(line.text);

      if (!stat || !allowedStats.includes(stat) || target[stat] !== undefined) {
        continue;
      }

      const value = this.readMainIntegerFromText(line.text);

      if (value !== undefined && value >= 1 && value <= 999) {
        target[stat] = value;
      }
    }
  }

  /**
   * Respaldo cuando Vision detecta los números, pero no la etiqueta. Agrupa
   * los números en tres filas y toma el primero de cada fila, ignorando el EV.
   */
  private assignStatsFromNumericRows(
    target: Partial<Record<PokemonStatKey, number>>,
    words: VisionWord[],
    card: DetectedCard,
    rect: Rect,
    orderedStats: PokemonStatKey[],
  ): void {
    const height = card.bottom - card.top;
    const numericWords = this.wordsInRect(words, rect)
      .map((word) => ({ word, value: this.parseIntegerToken(word.text) }))
      .filter(
        (entry): entry is { word: VisionWord; value: number } =>
          entry.value !== undefined && entry.value >= 1 && entry.value <= 999,
      );

    const groups = this.groupWordsByRow(
      numericWords.map((entry) => entry.word),
      Math.max(5, Math.round(height * 0.07)),
    )
      .map((group) => {
        const values = group
          .map((word) => ({ word, value: this.parseIntegerToken(word.text) }))
          .filter(
            (entry): entry is { word: VisionWord; value: number } =>
              entry.value !== undefined,
          )
          .sort((a, b) => a.word.left - b.word.left);

        return {
          centerY: this.averageCenterY(group),
          value: values[0]?.value,
        };
      })
      .filter((row) => row.value !== undefined)
      .filter((row) => row.centerY >= card.top + height * 0.20)
      .filter((row) => row.centerY <= card.top + height * 0.90)
      .sort((a, b) => a.centerY - b.centerY)
      .slice(0, 3);

    orderedStats.forEach((stat, index) => {
      if (target[stat] === undefined && groups[index]?.value !== undefined) {
        target[stat] = groups[index].value;
      }
    });
  }

  private getStatRowCenters(
    words: VisionWord[],
    size: ImageSize,
    card: DetectedCard,
  ): Partial<Record<PokemonStatKey, number>> {
    if (!words.length) {
      return {};
    }

    const width = card.right - card.left;
    const height = card.bottom - card.top;
    const result: Partial<Record<PokemonStatKey, number>> = {};

    const regions: Rect[] = [
      {
        left: card.left + width * 0.04,
        right: card.left + width * 0.52,
        top: card.top + height * 0.14,
        bottom: card.bottom,
      },
      {
        left: card.left + width * 0.48,
        right: card.right,
        top: card.top + height * 0.14,
        bottom: card.bottom,
      },
    ];

    for (const region of regions) {
      for (const line of this.linesInRect(words, region, size, height)) {
        const stat = this.detectStatKey(line.text);

        if (stat && result[stat] === undefined) {
          result[stat] = line.centerY;
        }
      }
    }

    return result;
  }

  private detectStatKey(value: string): PokemonStatKey | undefined {
    const text = this.normalizeText(value)
      .replace(/[._:/-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (
      /\b(sp atk|sp attack|special attack|at esp|atq esp|atq spe|attaque spe|sp ang|spezial angriff|att sp)\b/.test(
        text,
      )
    ) {
      return 'spa';
    }

    if (
      /\b(sp def|special defense|special defence|def esp|def spe|defense spe|sp vert|spezial verteidigung|dif sp)\b/.test(
        text,
      )
    ) {
      return 'spd';
    }

    if (/\b(hp|ps|pv|kp)\b/.test(text)) {
      return 'hp';
    }

    if (/\b(attack|atk|ataque|attaque|angriff|attacco)\b/.test(text)) {
      return 'atk';
    }

    if (/\b(defense|defence|defensa|verteidigung|difesa)\b/.test(text)) {
      return 'def';
    }

    if (/\b(speed|velocidad|vitesse|initiative|velocita)\b/.test(text)) {
      return 'spe';
    }

    return undefined;
  }

  private readMainIntegerFromText(value: string): number | undefined {
    const tokens = String(value || '').match(/\b[0-9OoIl]{1,3}\b/g) ?? [];

    for (const token of tokens) {
      const parsed = this.parseIntegerToken(token);

      if (parsed !== undefined) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseIntegerToken(value: string): number | undefined {
    const token = String(value || '').trim();

    if (!/[0-9]/.test(token) || !/^[0-9OoIl]{1,3}$/.test(token)) {
      return undefined;
    }

    const parsed = Number(token.replace(/[Oo]/g, '0').replace(/[Il]/g, '1'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private createPurpleMask(buffer: PixelBuffer): Uint8Array {
    const mask = new Uint8Array(buffer.width * buffer.height);

    for (let y = 0; y < buffer.height; y += 1) {
      for (let x = 0; x < buffer.width; x += 1) {
        const pixelIndex = (y * buffer.width + x) * buffer.channels;
        const red = buffer.data[pixelIndex];
        const green = buffer.data[pixelIndex + 1];
        const blue = buffer.data[pixelIndex + 2];

        const isCardPurple =
          blue > 135 &&
          blue - red > 25 &&
          blue - green > 25 &&
          red > 45 &&
          green > 40 &&
          red < 210 &&
          green < 200;

        mask[y * buffer.width + x] = isCardPurple ? 1 : 0;
      }
    }

    return mask;
  }

  private detectCardsFromMask(
    mask: Uint8Array,
    width: number,
    height: number,
    originalSize: ImageSize,
  ): DetectedCard[] {
    const cards: DetectedCard[] = [];
    const sides: Array<{ start: number; end: number; column: 0 | 1 }> = [
      { start: 0, end: Math.floor(width / 2), column: 0 },
      { start: Math.floor(width / 2), end: width, column: 1 },
    ];

    for (const side of sides) {
      const rowCoverage: number[] = [];
      const sideWidth = side.end - side.start;

      for (let y = 0; y < height; y += 1) {
        let count = 0;

        for (let x = side.start; x < side.end; x += 1) {
          count += mask[y * width + x];
        }

        rowCoverage.push(count / sideWidth);
      }

      const smoothedRows = this.smooth(rowCoverage, 7);
      const rowFlags = smoothedRows.map(
        (coverage, y) =>
          coverage > 0.16 &&
          y > height * 0.15 &&
          y < height * 0.90,
      );

      const rowBands = this.findBands(
        rowFlags,
        smoothedRows,
        Math.max(18, Math.round(height * 0.08)),
      );

      const selectedRows = rowBands
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .sort((a, b) => a.start - b.start);

      selectedRows.forEach((rowBand, rowIndex) => {
        const columnCoverage: number[] = [];

        for (let x = side.start; x < side.end; x += 1) {
          let count = 0;

          for (let y = rowBand.start; y < rowBand.end; y += 1) {
            count += mask[y * width + x];
          }

          columnCoverage.push(count / Math.max(1, rowBand.end - rowBand.start));
        }

        const smoothedColumns = this.smooth(columnCoverage, 9);
        const columnFlags = smoothedColumns.map((coverage) => coverage > 0.18);
        const columnBands = this.findBands(
          columnFlags,
          smoothedColumns,
          Math.max(50, Math.round(sideWidth * 0.20)),
        );

        const selectedColumn = columnBands.sort(
          (a, b) => b.end - b.start - (a.end - a.start),
        )[0];

        if (!selectedColumn) {
          return;
        }

        const scaleX = originalSize.width / width;
        const scaleY = originalSize.height / height;
        const slot = rowIndex * 2 + side.column + 1;

        cards.push({
          slot,
          source: 'pixel',
          left: Math.round((side.start + selectedColumn.start) * scaleX),
          right: Math.round((side.start + selectedColumn.end) * scaleX),
          top: Math.round(rowBand.start * scaleY),
          bottom: Math.round(rowBand.end * scaleY),
        });
      });
    }

    return cards;
  }

  private isValidCardSet(cards: DetectedCard[], size: ImageSize): boolean {
    if (cards.length !== 6 || new Set(cards.map((card) => card.slot)).size !== 6) {
      return false;
    }

    const widths = cards.map((card) => card.right - card.left);
    const heights = cards.map((card) => card.bottom - card.top);
    const medianWidth = this.median(widths);
    const medianHeight = this.median(heights);

    if (
      medianWidth < size.width * 0.20 ||
      medianWidth > size.width * 0.50 ||
      medianHeight < size.height * 0.10 ||
      medianHeight > size.height * 0.30
    ) {
      return false;
    }

    return cards.every((card) => {
      const width = card.right - card.left;
      const height = card.bottom - card.top;

      return (
        width >= medianWidth * 0.78 &&
        width <= medianWidth * 1.22 &&
        height >= medianHeight * 0.72 &&
        height <= medianHeight * 1.28
      );
    });
  }

  private getFallbackCards(size: ImageSize): DetectedCard[] {
    const layout = this.getFallbackLayout(size);
    const scale = Math.min(size.width / BASE_WIDTH, size.height / BASE_HEIGHT);
    const viewportWidth = BASE_WIDTH * scale;
    const viewportHeight = BASE_HEIGHT * scale;
    const offsetX = (size.width - viewportWidth) / 2;
    const offsetY = (size.height - viewportHeight) / 2;

    return FALLBACK_LAYOUTS[layout].map((card) => ({
      slot: card.slot,
      source: 'fallback',
      left: Math.round(offsetX + card.left * scale),
      right: Math.round(offsetX + card.right * scale),
      top: Math.round(offsetY + card.top * scale),
      bottom: Math.round(offsetY + card.bottom * scale),
    }));
  }

  private resolveCards(
    size: ImageSize,
    cardsOrLayout?: DetectedCard[] | CardLayoutName,
  ): DetectedCard[] {
    if (Array.isArray(cardsOrLayout) && cardsOrLayout.length === 6) {
      return [...cardsOrLayout].sort((a, b) => a.slot - b.slot);
    }

    if (typeof cardsOrLayout === 'string') {
      const fallback = this.getFallbackCards(size);
      const requested = FALLBACK_LAYOUTS[cardsOrLayout];
      const defaultLayout = this.getFallbackLayout(size);

      if (cardsOrLayout === defaultLayout) {
        return fallback;
      }

      const scale = Math.min(size.width / BASE_WIDTH, size.height / BASE_HEIGHT);
      const offsetX = (size.width - BASE_WIDTH * scale) / 2;
      const offsetY = (size.height - BASE_HEIGHT * scale) / 2;

      return requested.map((card) => ({
        slot: card.slot,
        source: 'fallback',
        left: Math.round(offsetX + card.left * scale),
        right: Math.round(offsetX + card.right * scale),
        top: Math.round(offsetY + card.top * scale),
        bottom: Math.round(offsetY + card.bottom * scale),
      }));
    }

    return this.getFallbackCards(size);
  }

  private getFallbackLayout(size: ImageSize): CardLayoutName {
    return size.width / size.height > 1.95 ? 'compact' : 'standard';
  }

  private linesInRect(
    words: VisionWord[],
    rect: Rect,
    _size: ImageSize,
    referenceHeight = rect.bottom - rect.top,
  ): VisionLine[] {
    return this.buildLines(
      this.wordsInRect(words, rect),
      Math.max(5, Math.round(referenceHeight * 0.055)),
    );
  }

  private wordsInRect(words: VisionWord[], rect: Rect): VisionWord[] {
    return words.filter((word) =>
      this.pointInRect(word.centerX, word.centerY, rect),
    );
  }

  private pointInRect(x: number, y: number, rect: Rect): boolean {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  private groupWordsByRow(words: VisionWord[], tolerance: number): VisionWord[][] {
    const groups: VisionWord[][] = [];
    const ordered = [...words].sort((a, b) => {
      if (Math.abs(a.centerY - b.centerY) <= tolerance) {
        return a.left - b.left;
      }

      return a.centerY - b.centerY;
    });

    for (const word of ordered) {
      const nearest = groups
        .map((group) => ({
          group,
          distance: Math.abs(this.averageCenterY(group) - word.centerY),
        }))
        .filter((candidate) => candidate.distance <= tolerance)
        .sort((a, b) => a.distance - b.distance)[0];

      if (nearest) {
        nearest.group.push(word);
      } else {
        groups.push([word]);
      }
    }

    return groups;
  }

  private wordsToLine(words: VisionWord[]): VisionLine {
    const ordered = [...words].sort((a, b) => a.left - b.left);
    const left = Math.min(...ordered.map((word) => word.left));
    const right = Math.max(...ordered.map((word) => word.right));
    const top = Math.min(...ordered.map((word) => word.top));
    const bottom = Math.max(...ordered.map((word) => word.bottom));

    return {
      text: this.cleanText(ordered.map((word) => word.text).join(' ')),
      left,
      right,
      top,
      bottom,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
    };
  }

  private cleanDetectedText(value: string): string {
    const tokens = this.cleanText(value)
      .replace(/[♀♂©®]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);

    while (
      tokens.length > 1 &&
      (/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(tokens[0]) || tokens[0].length === 1)
    ) {
      tokens.shift();
    }

    return tokens
      .join(' ')
      .replace(/^[|•·:;,._-]+/, '')
      .replace(/[|•·:;,._-]+$/, '')
      .trim();
  }

  private isUsefulInfoText(value: string): boolean {
    const text = this.cleanDetectedText(value);

    if (!text || text.length <= 1 || /^\d+$/.test(text)) {
      return false;
    }

    return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2}/.test(text);
  }

  private uniqueTextLines(values: string[]): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const value of values) {
      const cleaned = this.cleanDetectedText(value);
      const key = this.normalizeText(cleaned);

      if (!cleaned || !key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push(cleaned);
    }

    return result;
  }

  private sameText(first?: string, second?: string): boolean {
    if (!first || !second) {
      return false;
    }

    return this.normalizeText(first) === this.normalizeText(second);
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanText(value: string): string {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  private deduplicateWords(words: VisionWord[]): VisionWord[] {
    const result: VisionWord[] = [];
    const seen = new Set<string>();

    for (const word of words) {
      const key = [
        this.normalizeText(word.text),
        Math.round(word.centerX / 3),
        Math.round(word.centerY / 3),
      ].join('|');

      if (!seen.has(key)) {
        seen.add(key);
        result.push(word);
      }
    }

    return result;
  }

  private countNaturePixels(
    data: Buffer,
    width: number,
    height: number,
    channels: number,
    rect: Rect,
  ): { increasedPixels: number; decreasedPixels: number } {
    const left = this.clamp(Math.floor(rect.left), 0, width - 1);
    const right = this.clamp(Math.ceil(rect.right), left + 1, width);
    const top = this.clamp(Math.floor(rect.top), 0, height - 1);
    const bottom = this.clamp(Math.ceil(rect.bottom), top + 1, height);
    let increasedPixels = 0;
    let decreasedPixels = 0;

    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const index = (y * width + x) * channels;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];

        const isIncreased =
          red > 190 &&
          red - green > 30 &&
          red - blue > 5 &&
          green < 205;

        const isDecreased =
          blue > 185 &&
          green > 140 &&
          red < 205 &&
          blue - red > 18 &&
          green - red > 2;

        if (isIncreased) {
          increasedPixels += 1;
        }

        if (isDecreased) {
          decreasedPixels += 1;
        }
      }
    }

    return { increasedPixels, decreasedPixels };
  }

  private smooth(values: number[], windowSize: number): number[] {
    const radius = Math.floor(windowSize / 2);

    return values.map((_value, index) => {
      let total = 0;
      let count = 0;

      for (let offset = -radius; offset <= radius; offset += 1) {
        const current = index + offset;

        if (current >= 0 && current < values.length) {
          total += values[current];
          count += 1;
        }
      }

      return count ? total / count : 0;
    });
  }

  private findBands(
    flags: boolean[],
    scores: number[],
    minimumLength: number,
  ): MaskBand[] {
    const bands: MaskBand[] = [];
    let start: number | undefined;

    for (let index = 0; index <= flags.length; index += 1) {
      const enabled = index < flags.length ? flags[index] : false;

      if (enabled && start === undefined) {
        start = index;
      }

      if (!enabled && start !== undefined) {
        const end = index;

        if (end - start >= minimumLength) {
          const section = scores.slice(start, end);
          const average = section.reduce((sum, value) => sum + value, 0) / section.length;
          bands.push({ start, end, score: average * (end - start) });
        }

        start = undefined;
      }
    }

    return bands;
  }

  private median(values: number[]): number {
    const ordered = [...values].sort((a, b) => a - b);
    const middle = Math.floor(ordered.length / 2);

    if (ordered.length % 2 === 0) {
      return (ordered[middle - 1] + ordered[middle]) / 2;
    }

    return ordered[middle];
  }

  private averageCenterY(words: VisionWord[]): number {
    if (!words.length) {
      return 0;
    }

    return words.reduce((total, word) => total + word.centerY, 0) / words.length;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value));
  }
}
