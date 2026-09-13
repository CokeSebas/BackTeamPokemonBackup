import { Module } from '@nestjs/common';
import { SheetService } from './sheet.service';
import { SheetController } from './sheet.controller';
import { TeamsModule } from '../teams/teams.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TeamsModule,
    NotificationModule,
  ],
  controllers: [SheetController],
  providers: [SheetService],
})
export class SheetModule {}
