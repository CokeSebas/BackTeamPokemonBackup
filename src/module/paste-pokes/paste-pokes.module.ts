import { Module } from '@nestjs/common';
import { PastePokesService } from './paste-pokes.service';
import { PastePokesController } from './paste-pokes.controller';
import { HttpModule } from '@nestjs/axios';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from 'src/db/entities/pokemon.entity';
import { SubFormatsModule } from '../subFormats/subFormats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pokemon
    ]),
    SubFormatsModule,
    HttpModule
  ],
  controllers: [PastePokesController],
  providers: [PastePokesService, ImageValidatorService],
})
export class PastePokesModule {}
