// paste.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { PastePokesService } from './paste-pokes.service';
import { ParsePasteDto } from './dto/parse-paste.dto';

@Controller('paste-pokes')
export class PastePokesController {
  constructor(private readonly pasteService: PastePokesService) {}

  @Post('import')
  async importFromPaste(@Body() body: ParsePasteDto) {
    console.log('(C) importFromPaste:');

    //const teamJson = await this.pasteService.getTeamJson(body.url.trim()+'/json');
//
    //const pokemons = await this.pasteService.parsePokemon(teamJson.paste);


    await this.pasteService.importPaste(body.url, body.subformat, 2);

    return {
      subformat: body.subformat,
      url: body.url,
      msj: 'Importación desde paste exitosa',
    };
  }
}