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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    this.logger.log('(S) Sending verification email', MailService.name);

    const url = `${process.env.FRONTEND_URL}verify-account?token=${token}`;

    await this.transporter.sendMail({
      to,
      subject: 'Verifica tu cuenta | PokéCircuit',
      html: `
        <div style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                
                <!-- Card principal -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e293b;border-radius:12px;padding:40px;">
                  
                  <!-- Logo / Título -->
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <img 
                        src="https://pokecircuit.com/img/pokecircuit.e21f3a90.png" 
                        alt="PokéCircuit Logo"
                        width="180"
                        style="display:block;margin:0 auto 20px auto;"
                      />
                      <h1 style="color:#facc15;margin:0;font-size:28px;">
                        PokéCircuit
                      </h1>
                      <p style="color:#94a3b8;margin:5px 0 0 0;font-size:14px;">
                        Plataforma de torneos competitivos
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido -->
                  <tr>
                    <td style="color:#e2e8f0;font-size:16px;line-height:24px;padding-top:20px;">
                      <h2 style="color:#ffffff;margin-top:0;">
                        ¡Verifica tu cuenta!
                      </h2>

                      <p>
                        Gracias por registrarte en <strong>PokéCircuit</strong>.
                        Para comenzar a participar en torneos y rankings,
                        necesitamos que confirmes tu dirección de correo.
                      </p>

                      <p style="text-align:center;margin:30px 0;">
                        <a href="${url}" target="_blank"
                          style="
                            background-color:#facc15;
                            color:#0f172a;
                            padding:14px 28px;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:bold;
                            display:inline-block;
                          ">
                          Verificar cuenta
                        </a>
                      </p>

                      <p style="font-size:14px;color:#94a3b8;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                      </p>

                      <p style="word-break:break-all;font-size:13px;color:#cbd5e1;">
                        ${url}
                      </p>

                      <hr style="border:none;border-top:1px solid #334155;margin:30px 0;" />

                      <p style="font-size:12px;color:#64748b;text-align:center;">
                        Este enlace expirará en unas horas por motivos de seguridad.
                        Si no creaste una cuenta en PokéCircuit, puedes ignorar este mensaje.
                      </p>
                    </td>
                  </tr>

                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                  <tr>
                    <td align="center" style="font-size:12px;color:#475569;">
                      © ${new Date().getFullYear()} PokéCircuit · Todos los derechos reservados
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </div>
      `,
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    this.logger.log('(S) Sending reset password email', MailService.name);

    const url = `${process.env.FRONTEND_URL}reset-password?token=${token}`;

    await this.transporter.sendMail({
      to,
      subject: 'Restablece tu contraseña | PokéCircuit',
      html: `
        <div style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                
                <!-- Card principal -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e293b;border-radius:12px;padding:40px;">
                  
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <img 
                        src="https://pokecircuit.com/img/pokecircuit.e21f3a90.png" 
                        alt="PokéCircuit Logo"
                        width="180"
                        style="display:block;margin:0 auto 20px auto;"
                      />
                      <p style="color:#94a3b8;margin:0;font-size:14px;">
                        Plataforma de torneos competitivos
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido -->
                  <tr>
                    <td style="color:#e2e8f0;font-size:16px;line-height:24px;padding-top:20px;">
                      
                      <h2 style="color:#ffffff;margin-top:0;">
                        Solicitud para restablecer contraseña
                      </h2>

                      <p>
                        Recibimos una solicitud para cambiar tu contraseña en 
                        <strong>PokéCircuit</strong>.
                      </p>

                      <p>
                        Si fuiste tú, puedes crear una nueva contraseña haciendo clic en el botón:
                      </p>

                      <p style="text-align:center;margin:30px 0;">
                        <a href="${url}" target="_blank"
                          style="
                            background-color:#ef4444;
                            color:#ffffff;
                            padding:14px 28px;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:bold;
                            display:inline-block;
                          ">
                          Restablecer contraseña
                        </a>
                      </p>

                      <p style="font-size:14px;color:#94a3b8;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>

                      <p style="word-break:break-all;font-size:13px;color:#cbd5e1;">
                        ${url}
                      </p>

                      <hr style="border:none;border-top:1px solid #334155;margin:30px 0;" />

                      <p style="font-size:13px;color:#f87171;">
                        ⚠️ Este enlace expirará en unas horas por motivos de seguridad.
                      </p>

                      <p style="font-size:12px;color:#64748b;text-align:center;margin-top:20px;">
                        Si no solicitaste este cambio, puedes ignorar este mensaje.
                        Tu contraseña actual seguirá siendo válida.
                      </p>

                    </td>
                  </tr>

                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                  <tr>
                    <td align="center" style="font-size:12px;color:#475569;">
                      © ${new Date().getFullYear()} PokéCircuit · Seguridad y Competencia
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </div>
      `,
    });
  }
}
