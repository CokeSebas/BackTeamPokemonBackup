import { Injectable } from '@nestjs/common';
const sharp = require('sharp');

@Injectable()
export class ImageService {

  /**
   * Obtiene información de la imagen
   */
  async getMetadata(image: Buffer) {
    return await sharp(image).metadata();
  }

  /**
   * Recorta un área cualquiera
   */
  async crop(
    image: Buffer,
    left: number,
    top: number,
    width: number,
    height: number,
  ): Promise<Buffer> {

    return await sharp(image)
      .extract({
        left,
        top,
        width,
        height,
      })
      .png()
      .toBuffer();
  }

  /**
   * Recorta el primer Pokémon (prueba)
   */
  async cropPokemon1(image: Buffer): Promise<Buffer> {

    return await this.crop(
      image,
      180, // left
      220, // top
      360, // width
      470, // height
    );

  }

}