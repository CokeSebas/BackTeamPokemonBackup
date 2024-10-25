import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from './jwt-token.service'; // Importa tu servicio de JWT

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1]; // Asumiendo formato: "Bearer <token>"
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = await this.jwtTokenService.validateToken(token); // Reutiliza el método de validación
      req['user'] = decoded; // Almacena los datos del usuario en la request
      next(); // Continúa al siguiente middleware/controlador
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
