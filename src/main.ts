import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  dotenv.config(); // Cargar variables de entorno desde .env

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // Limitar a 10 solicitudes por IP
  });

  app.use(limiter); // Aplicar rate limiting a toda la aplicación

  // Habilitar CORS con configuración predeterminada
  app.enableCors();

  // Configurar prefijo global para todas las rutas (opcional)
  app.setGlobalPrefix('api');



  await app.listen(port);
  console.log('servidor corridendo en http://localhost:'+port+'/api');
  //npm run start:dev
}
bootstrap();
