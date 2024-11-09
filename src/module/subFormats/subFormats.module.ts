import { Module } from '@nestjs/common';
import { SubFormat } from "../../db/entities/subFormat.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { SubFormatsController } from "./subFormats.controller";
import { SubFormatsService } from "./subFormats.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubFormat
    ])
  ],
  controllers: [
    SubFormatsController
  ],
  providers: [
    SubFormatsService, MyLoggerService
  ],
  exports: [
    SubFormatsService, TypeOrmModule
  ]
})
export class SubFormatsModule {}