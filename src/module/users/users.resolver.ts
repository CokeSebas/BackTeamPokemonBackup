import { MyLoggerService } from "../common/logger/myLogger.service";
import { PasswordEncriptService } from "../common/password-encript/password-encript.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { Injectable } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtTokenService } from "../common/jwt-token/jwt-token.service";

@Injectable()
export class UsersResolver {
  constructor(
      private readonly usersService: UsersService,
      private readonly logger: MyLoggerService,
      private readonly passwordEncriptService: PasswordEncriptService,
      private readonly jwtTokenService: JwtTokenService
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
      createUserDto.isActive = true;
        
      // Crear un nuevo usuario
      const user = await this.usersService.create(createUserDto);

      console.log(user);

      //return null;

      const token = await this.jwtTokenService.createToken(user.id);

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
      data = {
        'name': user.name,
        'lastName': user.lastName,
        'email': user.email,
        'avatarUrl': user.avatarUrl,
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

  async loginUser(loginUserDto: CreateUserDto): Promise<Object> {
    this.logger.log('(R) Login user: ', UsersResolver.name);

    let salida = [], data = {};

    const email = loginUserDto.email;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.error('El usuario no existe', UsersResolver.name);
      
      salida = [{
        message: 'El usuario no existe',
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

    const token = await this.jwtTokenService.createToken(user.id);

    data = {
      'name': user.name,
      'lastName': user.lastName,
      'email': user.email,
      'avatarUrl': user.avatarUrl,
      'token': token
    };

    salida = [{ 
      data: data,
      message: 'Usuario autenticado correctamente',
      status: 'success',
      code: 200 
    }];

    return salida;    
  }
}
