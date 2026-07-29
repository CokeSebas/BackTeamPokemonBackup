import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
const sharp = require('sharp');

export interface VisionOcrRegion {
  slot: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface VisionRegionalResult {
  region: VisionOcrRegion;
  result: any;
  outputWidth: number;
  outputHeight: number;
}

@Injectable()
export class VisionService {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient({
      keyFilename: path.join(
        process.cwd(),
        './src/keys',
        'google-vision.json',
      ),
    });
  }

  async detectText(image: Buffer) {
    console.log('Detecting text in image...');

    const preparedImage = await sharp(image)
      .removeAlpha()
      .sharpen({ sigma: 0.8 })
      .png()
      .toBuffer();

    const [result] = await this.client.documentTextDetection({
      image: {
        content: preparedImage,
      },
      imageContext: {
        languageHints: ['es', 'en'],
      },
    });

    return result;
  }

  /**
   * Reprocesa únicamente las tarjetas que quedaron incompletas.
   *
   * Cada recorte se amplía antes de enviarlo a Vision. Al aislar una tarjeta se
   * reduce el ruido de la interfaz y el texto pequeño ocupa muchos más píxeles.
   */
  async detectTextRegions(
    image: Buffer,
    regions: VisionOcrRegion[],
  ): Promise<VisionRegionalResult[]> {
    if (!regions.length) {
      return [];
    }

    const metadata = await sharp(image).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('No fue posible obtener las dimensiones de la imagen');
    }

    return Promise.all(
      regions.map(async (region) => {
        const left = this.clamp(Math.floor(region.left), 0, metadata.width - 1);
        const top = this.clamp(Math.floor(region.top), 0, metadata.height - 1);
        const right = this.clamp(Math.ceil(region.right), left + 1, metadata.width);
        const bottom = this.clamp(Math.ceil(region.bottom), top + 1, metadata.height);
        const width = right - left;
        const height = bottom - top;
        const targetWidth = this.clamp(Math.round(width * 2.1), 1000, 1500);

        const prepared = await sharp(image)
          .extract({ left, top, width, height })
          .resize({
            width: targetWidth,
            withoutEnlargement: false,
            kernel: 'lanczos3',
          })
          .grayscale()
          .normalize()
          .sharpen({ sigma: 1 })
          .png()
          .toBuffer({ resolveWithObject: true });

        const [result] = await this.client.documentTextDetection({
          image: {
            content: prepared.data,
          },
          imageContext: {
            languageHints: ['es', 'en'],
          },
        });

        return {
          region: {
            ...region,
            left,
            top,
            right,
            bottom,
          },
          result,
          outputWidth: prepared.info.width,
          outputHeight: prepared.info.height,
        };
      }),
    );
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value));
  }
}
