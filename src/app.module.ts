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
import { SubFormatsModule } from './module/subFormats/subFormats.module';
import { TournamentsModule } from './module/tournaments/tournaments.module';
import { TournamentRoundModule } from './module/tournament-rounds/tournament-rounds.module';
import { TournamentPairingsModule } from './module/tournament-pairings/tournament-pairings.module';
import { TournamentResultsModule } from './module/tournament-results/tournament-results.module';
import { TournamentStandingModule } from './module/tournamet-standing/tournament-standing.module';
import { PokModule } from './module/pokemon-seeder/pok.module';
import { TournamentTopPlayerModule } from './module/tournament-top-player/tournament-top-player.module';
import { SheetModule } from './module/sheet/sheet.module';
import { PastePokesModule } from './module/paste-pokes/paste-pokes.module';


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
      logging: false,  // Habilitar logging de BD
      ssl: {
        rejectUnauthorized: false, // Evita la verificación de certificados, útil para pruebas
      },
    }),
    CommonModule,
    UsersModule,
    TeamsModule,
    PokemonModule,
    FormatsModule,
    SubFormatsModule,
    TournamentsModule,
    TournamentRoundModule,
    TournamentPairingsModule,
    TournamentResultsModule,
    TournamentStandingModule,
    PokModule,
    TournamentTopPlayerModule,
    SheetModule,
    PastePokesModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
