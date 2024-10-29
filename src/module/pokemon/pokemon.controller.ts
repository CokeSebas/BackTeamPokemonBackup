import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Headers } from '@nestjs/common';
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
    return res.status(salida[0].code).json(salida[0]);
  }

  @Get('pokes-home')
  async getPokesHome(@Res() res: Response) {
    this.logger.log('(C) Getting all pokemons: ', PokemonController.name);
    const salida = await this.pokemonResolver.getPokesHome();
    return res.status(salida[0].code).json(salida[0]);
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    this.logger.log('(C) Getting one pokemon: ', PokemonController.name);
    const salida = await this.pokemonResolver.getPokemonById(+id);
    return res.status(salida[0].code).json(salida[0].data);
  }

  @Get('poke-user/:id')
  async getPokeByUser(@Res() res: Response, @Param('id') id: string, @Headers('authorization') token: string) {
    this.logger.log('(C) Getting pokemon user: ', PokemonController.name);
    const salida = await this.pokemonResolver.pokemonByUser(+id, token);
    return res.status(salida[0].code).json(salida[0]);
  }

  @Get('pokes-user/:id')
  async getPokesUser(@Res() res: Response, @Param('id') id: string) {
    this.logger.log('(C) Getting all pokemons by user: ', PokemonController.name);
    const salida = await this.pokemonResolver.pokemonsByUser(+id);
    return res.status(salida[0].code).json(salida[0]);
  }

  @Post('edit/:id')
  async update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto, @Res() res: Response) {
    this.logger.log('(C) Updating pokemon: '+id, PokemonController.name);
    const salida = await this.pokemonResolver.editPokemon(+id, updatePokemonDto);
    return res.status(salida[0].code).json(salida[0].data);
  }


  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }
}
