import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { UsersResolver } from './users.resolver';

@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly usersService: UsersService,
    private readonly usersResolver: UsersResolver
  ) {}


  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Creating user', UsersController.name);

    const salida = await this.usersResolver.create(createUserDto);

    if(salida[0].status == 'succes'){
      return res.status(salida[0].code).json({salida});
    }else{
      return res.status(salida[0].code).json({salida});
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.logger.log('(C) Getting all users', UsersController.name);
    
    const salida = await this.usersResolver.getAll();

    return res.status(salida[0].code).json({salida});
    //return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    this.logger.log('(C) Getting one user', UsersController.name);
    const salida = await this.usersResolver.getUserById(id); 
    return salida;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
