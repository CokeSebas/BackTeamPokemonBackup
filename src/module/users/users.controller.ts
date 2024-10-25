import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { UsersResolver } from './users.resolver';
import { ChangePasswordDto } from './dto/change-password.dto';

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

    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json({salida});
    }else{
      return res.status(salida[0].code).json({salida});
    }
  }

  @Get('/verify-account')
  async verifyAccount(@Query('token') token: string, @Res() res) {
    this.logger.log('(C) Verifying account', UsersController.name);
    const salida = await this.usersResolver.verifyEmail(token);
    return res.status(salida[0].code).json({salida});
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.logger.log('(C) Getting all users', UsersController.name);
    
    const salida = await this.usersResolver.getAll();

    return res.status(salida[0].code).json({salida});
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    this.logger.log('(C) Getting one user', UsersController.name);
    const salida = await this.usersResolver.getUserById(id); 
    return salida;
  }

  @Post('/edit/:id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Updating user '+id, UsersController.name);
    const salida = await this.usersResolver.editUser(id, updateUserDto);
    return res.status(salida[0].code).json({salida});
  }

  @Post('/edit/password/:id')
  async updatePassword(@Param('id') id: number, @Body() changePasswordDto: ChangePasswordDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Updating password '+id, UsersController.name);
    const salida = await this.usersResolver.changePassword(id, changePasswordDto);
    return res.status(salida[0].code).json({salida});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('/login')
  async login(@Body() loginUserDto: CreateUserDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Login user', UsersController.name);
    const salida = await this.usersResolver.loginUser(loginUserDto);
    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json(salida[0]);
    }else{
      return res.status(salida[0].code).json(salida[0]);
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() email : string, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Forgot password', UsersController.name);
    const salida = await this.usersResolver.forgotPassword(email);
    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json(salida[0]);
    }else{
      return res.status(salida[0].code).json(salida[0]);
    }
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto : any, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Reset password', UsersController.name);
    const salida = await this.usersResolver.resetPassword(resetPasswordDto);
    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json(salida[0]);
    }else{
      return res.status(salida[0].code).json(salida[0]);
    }
  }
}
