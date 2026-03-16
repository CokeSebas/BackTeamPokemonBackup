import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service';
import { SheetController } from './sheet.controller';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    TeamsModule,
  ],
  controllers: [SheetController],
  providers: [SheetService],
})
export class SheetModule {}
