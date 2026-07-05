import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
//import { CreateMatchDto } from './dto/create-match.dto';
//import { UpdateMatchDto } from './dto/update-match.dto';
import { CreateBulkMatchDto } from './dto/create-bulk-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  
  @Post('bulk')
  async createBulk(@Body() dto: CreateBulkMatchDto) {
    return this.matchesService.createBulk(dto);
  }

  @Get('/tournament-users/:id')
  getUserTournamentStats(@Param('id') id: number) {
    return this.matchesService.getUserTournamentStats(id);
  }

  @Post('/tournament-detail')
  getTournamentDetail(@Body('name') name: string,@Body('userId') userId: number ) {
    return this.matchesService.getTournamentDetail(userId, name);
  }

}