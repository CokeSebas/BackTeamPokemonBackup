import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Teams } from '../../db/entities/team.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { SubFormat } from '../../db/entities/subFormat.entity';

@Injectable()
export class TeamsService {

  constructor(
    @InjectRepository(Teams)
    private readonly teamRepository: Repository<Teams>,
    private readonly logger: MyLoggerService,
    @InjectRepository(SubFormat)
    private readonly subformatRepository: Repository<SubFormat>
  ) {}


  async create(createTeamDto: CreateTeamDto) {
    this.logger.log('(S) Creating team: ', TeamsService.name);
    
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
}
