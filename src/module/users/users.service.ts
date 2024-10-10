import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { PasswordEncriptService } from '../common/password-encript/password-encript.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: MyLoggerService,
  ) {}

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('(S) Creating user: ', UsersService.name);
    // Crear un nuevo usuario
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);  // Guardar el nuevo usuario en la base de datos
  }

  async findAll() {
    this.logger.log('(S) Getting all users: ', UsersService.name);
    return this.userRepository.find();
  }

  findOneByEmail(email: string) {
    this.logger.log('(S) Getting user by email: ', UsersService.name);
    return this.userRepository.findOne({ where: { email } });
  }
  findOne(id: number) {
    this.logger.log('(S) Getting user by id: ', UsersService.name);
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
