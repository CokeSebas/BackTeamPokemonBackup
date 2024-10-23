import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ImageValidatorService {
  constructor(private readonly httpService: HttpService) {}

  async checkImageExists(url: string): Promise<boolean> {
    try {
      // Realiza una solicitud HTTP HEAD para verificar si la imagen existe
      const response = await lastValueFrom(this.httpService.head(url));
      // Si la respuesta es exitosa (código 200), la imagen existe
      return response.status === 200;
    } catch (error) {
      // Si ocurre un error o la respuesta no es 200, la imagen no existe
      return false;
    }
  }
}
