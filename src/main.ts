import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Cargar variables de entorno desde .env

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  

  // Habilitar CORS con configuración predeterminada
  app.enableCors();

  // Configurar prefijo global para todas las rutas (opcional)
  app.setGlobalPrefix('api');



  await app.listen(port);
  console.log('servidor corridendo en http://localhost:'+port+'/api');
  //npm run start:dev
}
bootstrap();
