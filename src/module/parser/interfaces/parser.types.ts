export interface VisionWord {
  text: string;

  left: number;
  top: number;
  right: number;
  bottom: number;

  centerX: number;
  centerY: number;

  confidence: number;
}

export interface VisionLine {
  text: string;

  left: number;
  top: number;
  right: number;
  bottom: number;

  centerX: number;
  centerY: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export type PokemonStatKey =
  | 'hp'
  | 'atk'
  | 'def'
  | 'spa'
  | 'spd'
  | 'spe';

/**
 * Valores reales mostrados en la pantalla de características.
 * No corresponden a los EV pequeños que aparecen a la derecha.
 */
export interface PokemonStatsResult {
  slot: number;
  stats: Partial<Record<PokemonStatKey, number>>;
}

export interface PokemonInfo {
  slot: number;

  /**
   * Por ahora el nickname se utiliza también como especie.
   */
  nickname?: string;
  species?: string;

  ability?: string;
  item?: string;
  moves: string[];

  level?: number;

  /**
   * Stats reales que aparecen en la segunda imagen.
   */
  stats: Partial<Record<PokemonStatKey, number>>;

  /**
   * Naturaleza inferida a partir de las flechas de colores.
   */
  nature?: string;
}
