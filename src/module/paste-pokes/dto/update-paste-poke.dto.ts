import { PartialType } from '@nestjs/mapped-types';
import { CreatePastePokeDto } from './create-paste-poke.dto';

export class UpdatePastePokeDto extends PartialType(CreatePastePokeDto) {}
