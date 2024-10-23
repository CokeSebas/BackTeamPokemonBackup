import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Teams } from 'src/db/entities/team.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Injectable()
export class TeamsService {

  constructor(
    @InjectRepository(Teams)
    private readonly teamRepository: Repository<Teams>,
    private readonly logger: MyLoggerService
  ) {}


  async create(createTeamDto: Object) {
    this.logger.log('(S) Creating team: ', TeamsService.name);
    console.log(createTeamDto);
    const team = await this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(team);
  }

  async findAll() {
    this.logger.log('(S) Getting all teams: ', TeamsService.name);
    return this.teamRepository.find();
  }

  async findOne(id: number) {
    this.logger.log('(S) Getting team by id: '+id, TeamsService.name);
    return this.teamRepository.findOne({ where: { id } });
  }

  async findTeamsByUser(userId: number) {
    this.logger.log('(S) Getting teams by user id: '+userId, TeamsService.name);
    return this.teamRepository.find({ where: { userId } });
  }

  //async findByUserId(id: number) {
  //  this.logger.log('(S) Getting team by user id: '+id, TeamsService.name);
  //  return this.teamRepository.findOne({ where: { user: id } });
  //}

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
