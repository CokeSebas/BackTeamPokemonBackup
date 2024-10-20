import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { PokemonResolver } from './pokemon.resolver';

@Controller('pokemon')
export class PokemonController {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly logger: MyLoggerService,
    private readonly pokemonResolver: PokemonResolver, 
  ) {}

  @Post()
  async create(@Body() createPokemonDto: CreatePokemonDto, @Res() res: Response) {
    this.logger.log('(C) Creating pokemon: ', PokemonController.name);
    const salida = await this.pokemonResolver.create(createPokemonDto);

    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json({salida});
    }else{
      return res.status(salida[0].code).json({salida});
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.logger.log('(C) Getting all pokemons: ', PokemonController.name);
    const salida = await this.pokemonResolver.getAll();
    return res.status(salida[0].code).json({salida});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }
}
