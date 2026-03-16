// paste.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { SubFormat } from '../../db/entities/subFormat.entity';
import { Pokemon } from '../../db/entities/pokemon.entity';
import { Repository } from 'typeorm';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';

@Injectable()
export class PastePokesService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @InjectRepository(SubFormat)
    private readonly subformatRepository: Repository<SubFormat>,
    private readonly imgValidatorService: ImageValidatorService,
  ) {}
  
  private paradoxPastPokes = ['flutter mane', 'great tusk', 'scream tail', 'brute bonnet', 'slither wing', 'sandy shocks', 'roaring moon', 'walking wake', 'gouging fire', 'raging bolt'];

  async getTeamJson(urlPaste: string) {
    console.log('(S) getTeamJson:', urlPaste);
    try {
      const response = await lastValueFrom(
        this.httpService.get(urlPaste),
      );
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener los datos del equipo de Pokémon');
    }
  }
  

  async parsePokemon(paste: string) {
    console.log('(S) parsePokemon:');
    const blocks = paste.trim().split(/\n\s*\n/);

    return blocks.map((block) => {
      const lines = block.split('\n').map((l) => l.trim());

      const pokemon: any = {
        name: '',
        item: '',
        ability: '',
        teraType: '',
        evs: '',
        nature: '',
        ivs: '',
        moves: [],
      };

      const [name, item] = lines[0].split('@').map((s) => s.trim());
      pokemon.name = name;
      pokemon.item = item;

      for (const line of lines.slice(1)) {
        if (line.startsWith('Ability:'))
          pokemon.ability = line.replace('Ability:', '').trim();

        else if (line.startsWith('Tera Type:'))
          pokemon.teraType = line.replace('Tera Type:', '').trim();

        else if (line.startsWith('EVs:'))
          pokemon.evs = line.replace('EVs:', '').trim();

        else if (line.includes('Nature'))
          pokemon.nature = line.replace(' Nature', '').trim();

        else if (line.startsWith('IVs:'))
          pokemon.ivs = line.replace('IVs:', '').trim();

        else if (line.startsWith('-'))
          pokemon.moves.push(line.replace('-', '').trim());
      }

      return pokemon; // 👈 ahora sí correcto
    });
  }

  parseStats(statLine: string) {
    const result = { hp: null, atk: null, def: null, spa: null, spd: null, spe: null };

    if (!statLine) return result;

    for (const part of statLine.split('/')) {
      const [value, stat] = part.trim().split(' ');

      const map = {
        HP: 'hp',
        Atk: 'atk',
        Def: 'def',
        SpA: 'spa',
        SpD: 'spd',
        Spe: 'spe',
      };

      result[map[stat]] = Number(value);
    }

    return result;
  }


  async saveFromPaste(parsedTeam: any, userId: number, subFormatId: number) {
    console.log('(S) saveFromPaste:');

    if (!Array.isArray(parsedTeam)) {
      throw new Error('parsedTeam no es un array');
    }

    const subFormat = await this.subformatRepository.findOne({
      where: { id: subFormatId },
    });

    const entities: Pokemon[] = [];

    for (const poke of parsedTeam) {

      const evs = this.parseStats(poke.evs);
      const ivs = this.parseStats(poke.ivs);

      const image = await this.buildPokemonImage(poke.name);

      console.log(`(S) Procesando ${poke.name} - EVs: ${poke.evs} - IVs: ${poke.ivs} - Imagen: ${image}`);

      const entity = this.pokemonRepository.create({
        name: poke.name,
        nickPoke: poke.name,
        item: poke.item,
        ability: poke.ability,
        teraType: poke.teraType,
        nature: poke.nature?.replace(' Nature', ''),

        // EVs → default 0
        evsHp: evs.hp ?? 0,
        evsAtk: evs.atk ?? 0,
        evsDef: evs.def ?? 0,
        evsSpa: evs.spa ?? 0,
        evsSpd: evs.spd ?? 0,
        evsSpe: evs.spe ?? 0,

        // IVs → default 31
        ivsHp: ivs.hp ?? 31,
        ivsAtk: ivs.atk ?? 31,
        ivsDef: ivs.def ?? 31,
        ivsSpa: ivs.spa ?? 31,
        ivsSpd: ivs.spd ?? 31,
        ivsSpe: ivs.spe ?? 31,

        move1: poke.moves[0],
        move2: poke.moves[1],
        move3: poke.moves[2],
        move4: poke.moves[3],

        userId,
        subFormat,
        isPublic: true,
        urlImage: image,
      });

      entities.push(entity);
    }

    return this.pokemonRepository.save(entities);
  }


  async buildPokemonImage(nameSpecies: string): Promise<string> {

    let speciesName = nameSpecies.replace('(M)', '').replace('(F)', '').trim();
    let imgName = speciesName.toLowerCase().trim();
    let pokeImg = '';

    // 1️⃣ sprite gen5 normal
    if (await this.imgValidatorService.checkImageExists(
      `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`
    )) {
      pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
    }

    // 2️⃣ dex sprite
    else if (await this.imgValidatorService.checkImageExists(
      `https://play.pokemonshowdown.com/sprites/dex/${imgName.replace('-', '')}.png`
    )) {
      pokeImg = `https://play.pokemonshowdown.com/sprites/dex/${imgName.replace('-', '')}.png`;
    }

    // 3️⃣ casos especiales
    else if (
      imgName === 'tauros-paldea-aqua' ||
      imgName === 'tauros-paldea-blaze' ||
      imgName === 'tauros-paldea-combat' ||
      imgName === 'urshifu-rapid-strike'
    ) {
      imgName = imgName.replace(/-(?=[^-]*$)/, '');
      pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
    }

    else if (imgName.includes('iron')) {
      imgName = imgName.replace(' ', '');
      pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
    }

    else if (this.paradoxPastPokes.includes(imgName)) {
      imgName = imgName.replace(' ', '');
      pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
    }

    else if (imgName.includes('necrozma-')) {
      imgName = imgName.replace(/-(?=[^-]*$)/, '');
      pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
    }

    return pokeImg;
  }

  async importPaste(url: string, subFormatId: number, userId: number) {
    const teamJson = await this.getTeamJson(`${url}/json`);
    if (!teamJson?.paste) {
      throw new Error('El paste no contiene información válida');
    }
    const parsed = await this.parsePokemon(teamJson.paste); // 👈 FIX
    return this.saveFromPaste(parsed, userId, subFormatId);
  }

  formatPokemon(p: any) {
    return `${p.name} @ ${p.item}
Ability: ${p.ability}
Tera Type: ${p.teraType}
EVs: ${p.evs}
${p.nature}
${p.ivs ? `IVs: ${p.ivs}` : ''}
- ${p.moves.join('\n- ')}`;
  }
}