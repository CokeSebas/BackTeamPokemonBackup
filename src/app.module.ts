import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './module/common/common.module';
import { UsersModule } from './module/users/users.module';
import { TeamsModule } from './module/teams/teams.module';
import { PokemonModule } from './module/pokemon/pokemon.module';
import { FormatsModule } from './module/formats/formats.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto asegura que las variables estén disponibles globalmente
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // No usar en producción, ya que sincroniza los cambios en las entidades automáticamente
      logging: false,  // Habilitar logging
    }),
    CommonModule,
    UsersModule,
    TeamsModule,
    PokemonModule,
    FormatsModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
