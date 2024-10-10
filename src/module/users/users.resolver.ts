import { User } from "src/db/entities/user.entity";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { PasswordEncriptService } from "../common/password-encript/password-encript.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersResolver {
  constructor(
      private readonly usersService: UsersService,
      private readonly logger: MyLoggerService,
      private readonly passwordEncriptService: PasswordEncriptService
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
          code: 500
        }
      ];
    }else{
      this.logger.verbose('Crear usuario', UsersResolver.name);

      // Hash de la contraseña si se registra de manera local
      let hashedPassword = '';
      if (provider === 'local') {
        hashedPassword = await this.passwordEncriptService.encriptPassword(passwordHash);
      }
  
      //console.log(hashedPassword);
  
      createUserDto.passwordHash = hashedPassword;
        
      // Crear un nuevo usuario
      const user = this.usersService.create(createUserDto);

      salida = [{
        message: 'Usuario creado correctamente',
        status: 'success',
        code: 200
      }];
    }


    return salida;

    //return this.userRepository.save(user);  // Guardar el nuevo usuario en la base de datos
  }

  async getAll() {
    this.logger.log('(R) Getting all users: ', UsersResolver.name);
    let users = await this.usersService.findAll();

    let salida = [], datos = [];

    users.forEach(element => {
      let aux = {
        'name': 'Jorge',
        'lastName': 'Tapia',
        'email': 'cokesebas@gmail.com',
        'avatarUrl': '',
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
}
