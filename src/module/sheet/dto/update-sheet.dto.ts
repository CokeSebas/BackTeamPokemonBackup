import { PartialType } from '@nestjs/mapped-types';
import { CreateSheetDto } from './create-sheet.dto';

export class UpdateSheetDto extends PartialType(CreateSheetDto) {}
