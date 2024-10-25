import { MyLoggerService } from "../common/logger/myLogger.service";
import { PasswordEncriptService } from "../common/password-encript/password-encript.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtTokenService } from "../common/jwt-token/jwt-token.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { MailService } from "../common/mail/mail.service";

@Injectable()
export class UsersResolver {
  constructor(
      private readonly usersService: UsersService,
      private readonly logger: MyLoggerService,
      private readonly passwordEncriptService: PasswordEncriptService,
      private readonly jwtTokenService: JwtTokenService,
      private readonly mailService: MailService
  ){}

  async create(createUserDto: CreateUserDto): Promise<Object> {
    const { email, passwordHash, provider } = createUserDto;

    this.logger.log('(R) Creating user: ', UsersResolver.name);

    let salida = [];

    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      this.logger.error('El usuario ya existe', UsersResolver.name);
      //throw new ConflictException('El usuario ya existe');
      salida = [
        {
          message: 'El usuario ya existe',
          status: 'error',
          code: 202
        }
      ];
    }else{
      this.logger.verbose('Crear usuario', UsersResolver.name);

      // Hash de la contraseña si se registra de manera local
      let hashedPassword = '';
      if (provider === 'local') {
        hashedPassword = await this.passwordEncriptService.encriptPassword(passwordHash);
      }

      createUserDto.passwordHash = hashedPassword;
      createUserDto.isActive = false; // desactivar
        
      // Crear un nuevo usuario
      const user = await this.usersService.create(createUserDto);

      const token = await this.jwtTokenService.createToken('userId', user.id);

      // Genera un token de verificación
      const tokenMail = await this.jwtTokenService.createToken('email', email);

      // Enviar correo de verificación
      await this.mailService.sendVerificationEmail(email, tokenMail);

      salida = [{
        message: 'Usuario creado correctamente',
        status: 'success',
        code: 200,
        data: {
          'token': token
        }
      }];
    }
    return salida;
  }

  async verifyEmail(token: string): Promise<Object> {
    this.logger.log('(R) Verify email: ', UsersResolver.name);

    let tokenData = await this.jwtTokenService.validateToken(token);

    const email = tokenData.email;

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.isActive = true;

    await this.usersService.verifyEmailUser(user);

    const tokenId = await this.jwtTokenService.createToken('userId',user.id);

    const data = {
      'user': user,
      'name': user.name,
      'lastName': user.lastName,
      'email': user.email,
      'avatarUrl': user.avatarUrl,
      'token': tokenId,
      'nickName': user.nickName,
      'id': user.id
    };

    let salida = [{
      data: data,
      message: 'Email verificado correctamente',
      status: 'success',
      code: 200,
    }];

    return salida;
  }

  async getAll() {
    this.logger.log('(R) Getting all users: ', UsersResolver.name);
    let users = await this.usersService.findAll();

    let salida = [], datos = [];

    users.forEach(element => {
      let aux = {
        'name': element.name,
        'lastName': element.lastName,
        'email': element.email,
        'avatarUrl': element.avatarUrl,
      }

      datos.push(aux);

    });

    salida = [{
      message: 'Usuarios obtenidos correctamente',
      status: 'success',
      code: 200,
      data: datos
    }];

    return salida;
  }

  async getUserById(id: number) {
    this.logger.log('(R) Getting user by id: ', UsersResolver.name);
    let user = await this.usersService.findOne(id);

    let salida = [], data = {};

    if(user){
      let avatarUrl = '';

      if(user.isActive == true){
        if(user.avatarUrl != ''){
          avatarUrl = user.avatarUrl;
        }else{
          avatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
        }
        
        data = {
          'name': user.name,
          'lastName': user.lastName,
          'email': user.email,
          'avatarUrl': avatarUrl,
          'nickName': user.nickName
        };
  
        salida = [{
          data: data,
          message: 'Usuario obtenido correctamente',
          status: 'success',
          code: 200,
        }]
      }else{
        salida = [{
          data: data,
          message: 'Usuario no activado',
          status: 'error',
          code: 404
        }];
      }

    }else{
      salida = [{
        message: 'Usuario no encontrado',
        status: 'error',
        code: 404
      }];
    }
    
    return salida;
  }

  async editUser(id: number, updateUserDto: UpdateUserDto): Promise<Object> {
    this.logger.log('(R) Edit user: '+id, UsersResolver.name);

    let salida = [], data = {};

    const userExists = await this.usersService.findOne(id);
    
    if(userExists){
      const user = await this.usersService.update(id, updateUserDto);
      
      if(user.affected == 1){
        
        data = {
          'name': updateUserDto.name,
          'lastName': updateUserDto.lastName,
          'email': updateUserDto.email,
          'avatarUrl': updateUserDto.avatarUrl,
        };
  
        salida = [{
          data: data,
          message: 'Usuario editado correctamente',
          status: 'success',
          code: 200,
        }];

  
      }else{
        salida = [{
          message: 'Hubo un error al editar',
          status: 'error',
          code: 500,
        }];
      }

    }else{
      salida = [{
        message: 'Usuario no encontrado',
        status: 'error',
        code: 404
      }]
    }

    return salida;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<Object> {
    this.logger.log('(R) Change password: '+id, UsersResolver.name);
    const user =  await this.usersService.findOne(id);

    let salida = [], data = {};

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isMatch = await this.passwordEncriptService.comparePassword(changePasswordDto.currentPassword, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    user.passwordHash = await this.passwordEncriptService.encriptPassword(changePasswordDto.newPassword); // Hash de la nueva contraseña
    
    const updatedUser = await this.usersService.updatePassword(user);

    if(updatedUser){
      data = {
        'name': user.name,
        'lastName': user.lastName,
        'email': user.email,
        'avatarUrl': user.avatarUrl,
      };

      salida = [{
        data: data,
        message: 'Contraseña cambiada correctamente',
        status: 'success',
        code: 200,
      }];

    }else{
      salida = [{
        message: 'Hubo un error al cambiar la contraseña',
        status: 'error',
        code: 202,
      }];
    }

    return salida;
  }

  async loginUser(loginUserDto: CreateUserDto): Promise<Object> {
    this.logger.log('(R) Login user: ', UsersResolver.name);

    let salida = [], data = {};

    const email = loginUserDto.email;

    const user = await this.usersService.findOneByEmail(email);

    if(!user) {
      this.logger.error('El usuario no existe', UsersResolver.name);
      
      salida = [{
        message: 'El usuario no existe',
        status: 'error',
        code: 404
      }];

      return salida;
    }

    if(!user.isActive){
      this.logger.error('Usuario no activado', UsersResolver.name);
      salida = [{
        message: 'Usuario no activado',
        status: 'error',
        code: 404
      }];

      return salida;
    }

    const password = loginUserDto.passwordHash;

    const isPasswordValid = await this.passwordEncriptService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.error('La contraseña es incorrecta', UsersResolver.name);

      salida = [{
        data: data,
        message: 'Usuario o contraseña incorrecta',
        status: 'error',
        code: 202
      }];
      return salida;
    }

    const token = await this.jwtTokenService.createToken('userId',user.id);

    data = {
      'name': user.name,
      'lastName': user.lastName,
      'email': user.email,
      'avatarUrl': user.avatarUrl,
      'token': token,
      'nickName': user.nickName,
      'id': user.id
    };

    salida = [{ 
      data: data,
      message: 'Usuario autenticado correctamente',
      status: 'success',
      code: 200 
    }];

    return salida;    
  }

  async forgotPassword(email : string): Promise<Object> {
    this.logger.log('(R) Forgot password: ', UsersResolver.name);
    // Genera un token de verificación
    const tokenMail = await this.jwtTokenService.createToken('email', email['email']);

    // Enviar correo de verificación
    await this.mailService.sendResetPasswordEmail(email['email'], tokenMail);

    const salida = [{
      message: 'Se envio un correo de verificación',
      status: 'success',
      code: 200
    }];

    return salida;
  }


  async resetPassword(resetPasswordDto: any): Promise<Object> {
    this.logger.log('(R) Reset password: ', UsersResolver.name);
    const token = resetPasswordDto.token;

    const newPassword = resetPasswordDto.newPassword;

    const decoded = await this.jwtTokenService.decodeToken(token);

    const user = await this.usersService.findOneByEmail(decoded.email);

    let salida = [], data = {};

    if(!user) {
      this.logger.error('El usuario no existe', UsersResolver.name);

      salida = [{
        message: 'El usuario no existe',
        status: 'error',
        code: 404
      }];

      return salida;
    }

    const hashedPassword = await this.passwordEncriptService.encriptPassword(newPassword);

    user.passwordHash = hashedPassword;

    await this.usersService.updatePassword(user);

    data = {
      'name': user.name,
    };

    salida = [{
      data: data,
      message: 'Contraseña cambiada correctamente',
      status: 'success',
      code: 200,
    }];

    return salida;
  }



}
