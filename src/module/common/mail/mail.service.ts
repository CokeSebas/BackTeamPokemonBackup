import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MyLoggerService } from '../logger/myLogger.service';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly logger: MyLoggerService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // o tu proveedor de correo
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Usar SSL
      auth: {
        user: "teamsbackupokemon@gmail.com", // tu correo
        pass: "zwrlgimhbhvxgwis", // tu contraseña o token de acceso
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    this.logger.log('(S) Sending verification email', MailService.name);

    const url = `${process.env.FRONTEND_URL}/verify-account?token=${token}`;

    await this.transporter.sendMail({
      to,
      subject: 'Verificación de cuenta',
      html: `<h3>Verifica tu cuenta</h3><p>Haz clic en el siguiente enlace para verificar tu cuenta:</p><a target="_blank" href="${url}">Verificar cuenta</a>`,
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    this.logger.log('(S) Sending reset password email', MailService.name);

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      to,
      subject: 'Restablecer contraseña',
      html: `<h3>Restablecer contraseña</h3><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a target="_blank" href="${url}">Restablecer contraseña</a>`,
    });
  }
}
