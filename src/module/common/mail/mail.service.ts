import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MyLoggerService } from '../logger/myLogger.service';

interface MailTemplateOptions {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  url: string;
  warning?: string;
  footerText?: string;
}

@Injectable()
export class MailService {

  private readonly transporter: nodemailer.Transporter;
  private readonly frontendUrl: string;

  constructor(
    private readonly logger: MyLoggerService,
  ) {

    this.validateEnvironmentVariables();

    this.frontendUrl = this.normalizeFrontendUrl(
      process.env.FRONTEND_URL!,
    );

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      // Mantiene conexiones SMTP disponibles.
      pool: true,
      maxConnections: 5,
      maxMessages: 100,

      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    });
  }


  // =========================================================
  // VERIFICACIÓN DE CUENTA
  // =========================================================

  async sendVerificationEmail(
    to: string,
    token: string,
  ): Promise<void> {

    this.logger.log(
      `(S) Sending verification email to ${to}`,
      MailService.name,
    );

    const url = this.buildFrontendUrl(
      'verify-account',
      token,
    );

    const html = this.buildMailTemplate({
      title: '¡Verifica tu cuenta!',

      description: `
        Gracias por registrarte en <strong>PokéCircuit</strong>.
        Para comenzar a participar en torneos y rankings,
        necesitamos que confirmes tu dirección de correo.
      `,

      buttonText: 'Verificar cuenta',

      buttonColor: '#facc15',

      url,

      warning: `
        Este enlace expirará en unas horas por motivos de seguridad.
        Si no creaste una cuenta en PokéCircuit, puedes ignorar este mensaje.
      `,

      footerText: 'Todos los derechos reservados',
    });

    const text = `
PokéCircuit
¡Verifica tu cuenta!
Gracias por registrarte en PokéCircuit.
Para comenzar a participar en torneos y rankings necesitamos que confirmes tu dirección de correo.
Verifica tu cuenta ingresando al siguiente enlace:
${url}
Este enlace expirará en unas horas por motivos de seguridad.
Si no creaste una cuenta en PokéCircuit, puedes ignorar este mensaje.
    `.trim();


    await this.sendMail({
      to,
      subject: 'Verifica tu cuenta | PokéCircuit',
      html,
      text,
    });
  }


  // =========================================================
  // RECUPERAR CONTRASEÑA
  // =========================================================

  async sendResetPasswordEmail(
    to: string,
    token: string,
  ): Promise<void> {

    this.logger.log(
      `(S) Sending reset password email to ${to}`,
      MailService.name,
    );

    const url = this.buildFrontendUrl(
      'reset-password',
      token,
    );

    const html = this.buildMailTemplate({
      title: 'Solicitud para restablecer contraseña',

      description: `
        Recibimos una solicitud para cambiar tu contraseña en
        <strong>PokéCircuit</strong>.
        <br><br>
        Si fuiste tú, puedes crear una nueva contraseña haciendo clic
        en el siguiente botón.
      `,

      buttonText: 'Restablecer contraseña',

      buttonColor: '#ef4444',

      url,

      warning: `
        ⚠️ Este enlace expirará en unas horas por motivos de seguridad.
        <br><br>
        Si no solicitaste este cambio, puedes ignorar este mensaje.
        Tu contraseña actual seguirá siendo válida.
      `,

      footerText: 'Seguridad y Competencia',
    });

    const text = `
PokéCircuit
Solicitud para restablecer contraseña
Recibimos una solicitud para cambiar tu contraseña en PokéCircuit.
Puedes crear una nueva contraseña ingresando al siguiente enlace:
${url}
Este enlace expirará en unas horas por motivos de seguridad.
Si no solicitaste este cambio, puedes ignorar este mensaje.
Tu contraseña actual seguirá siendo válida.
    `.trim();


    await this.sendMail({
      to,
      subject: 'Restablece tu contraseña | PokéCircuit',
      html,
      text,
    });
  }


  // =========================================================
  // ENVÍO DE MAIL
  // =========================================================

  private async sendMail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {

    try {

      const result = await this.transporter.sendMail({
        from: {
          name: 'PokéCircuit',
          address: process.env.EMAIL_USER!,
        },
        to,
        subject,
        html,
        text,
      });

      this.logger.log(
        `(S) Email sent successfully: ${result.messageId}`,
        MailService.name,
      );

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      this.logger.log(
        `(S) Error sending email to ${to}: ${message}`,
        MailService.name,
      );

      throw error;
    }
  }


  // =========================================================
  // TEMPLATE GENERAL
  // =========================================================

  private buildMailTemplate(
    options: MailTemplateOptions,
  ): string {

    const {
      title,
      description,
      buttonText,
      buttonColor,
      url,
      warning,
      footerText = 'Todos los derechos reservados',
    } = options;

    const safeUrl = this.escapeHtml(url);

    const year = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >
        <meta
          http-equiv="Content-Type"
          content="text/html; charset=UTF-8"
        >
        <title>PokéCircuit</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background-color:#0f172a;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            background-color:#0f172a;
          "
        >

          <tr>
            <td
              align="center"
              style="
                padding:40px 15px;
              "
            >
              <!-- CONTENEDOR PRINCIPAL -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width:600px;
                  background-color:#1e293b;
                  border-radius:12px;
                  overflow:hidden;
                "
              >
                <!-- HEADER -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding:
                        40px
                        30px
                        20px
                        30px;
                    "
                  >
                    <img
                      src="https://pokecircuit.com/img/pokecircuit.e21f3a90.png"
                      alt="PokéCircuit"
                      width="180"
                      style="
                        display:block;
                        width:180px;
                        max-width:100%;
                        height:auto;
                        margin:0 auto 20px auto;
                      "
                    >
                    <p
                      style="
                        color:#94a3b8;
                        margin:0;
                        font-size:14px;
                      "
                    >
                      Plataforma de torneos competitivos
                    </p>
                  </td>
                </tr>
                <!-- CONTENIDO -->
                <tr>
                  <td
                    style="
                      padding:
                        20px
                        40px
                        40px
                        40px;
                      color:#e2e8f0;
                      font-size:16px;
                      line-height:24px;
                    "
                  >
                    <h1
                      style="
                        margin:
                          0
                          0
                          20px
                          0;
                        color:#ffffff;
                        font-size:24px;
                        line-height:32px;
                      "
                    >
                      ${title}
                    </h1>

                    <div
                      style="
                        color:#e2e8f0;
                        font-size:16px;
                        line-height:24px;
                      "
                    >
                      ${description}
                    </div>

                    <!-- BOTÓN -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin:
                          30px
                          0;
                      "
                    >
                      <tr>
                        <td
                          align="center"
                        >
                          <a
                            href="${safeUrl}"
                            target="_blank"
                            style="
                              display:inline-block;
                              background-color:${buttonColor};
                              color:${
                                buttonColor === '#facc15'
                                  ? '#0f172a'
                                  : '#ffffff'
                              };
                              padding:
                                14px
                                28px;
                              text-decoration:none;
                              border-radius:8px;
                              font-weight:bold;
                              font-size:16px;
                            "
                          >
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin:
                          0
                          0
                          10px
                          0;
                        font-size:14px;
                        color:#94a3b8;
                      "
                    >
                      Si el botón no funciona, copia y pega este
                      enlace en tu navegador:
                    </p>

                    <p
                      style="
                        margin:0;
                        word-break:break-all;
                        font-size:13px;
                        color:#cbd5e1;
                      "
                    >
                      <a
                        href="${safeUrl}"
                        target="_blank"
                        style="
                          color:#cbd5e1;
                          text-decoration:underline;
                        "
                      >
                        ${safeUrl}
                      </a>
                    </p>

                    ${
                      warning
                        ? `
                          <hr
                            style="
                              border:none;
                              border-top:
                                1px
                                solid
                                #334155;
                              margin:
                                30px
                                0;
                            "
                          >

                          <p
                            style="
                              margin:0;
                              font-size:12px;
                              line-height:18px;
                              color:#64748b;
                              text-align:center;
                            "
                          >
                            ${warning}
                          </p>
                        `
                        : ''
                    }

                  </td>
                </tr>
              </table>

              <!-- FOOTER -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"

                style="
                  max-width:600px;

                  margin-top:20px;
                "
              >

                <tr>
                  <td
                    align="center"
                    style="
                      font-size:12px;
                      color:#475569;
                      padding:
                        0
                        20px;
                    "
                  >
                    © ${year} PokéCircuit · ${footerText}

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }


  // =========================================================
  // URL
  // =========================================================

  private buildFrontendUrl(
    path: string,
    token: string,
  ): string {

    const url = new URL(
      path,
      this.frontendUrl,
    );

    url.searchParams.set(
      'token',
      token,
    );

    return url.toString();
  }


  private normalizeFrontendUrl(
    url: string,
  ): string {

    return url.endsWith('/')
      ? url
      : `${url}/`;
  }


  // =========================================================
  // SEGURIDAD HTML
  // =========================================================

  private escapeHtml(
    value: string,
  ): string {

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  // =========================================================
  // VARIABLES DE ENTORNO
  // =========================================================

  private validateEnvironmentVariables(): void {

    const requiredVariables = [
      'EMAIL_USER',
      'EMAIL_PASS',
      'FRONTEND_URL',
    ];

    const missingVariables =
      requiredVariables.filter(
        variable => !process.env[variable],
      );

    if (missingVariables.length > 0) {

      throw new Error(
        `Faltan variables de entorno requeridas: ${missingVariables.join(', ')}`,
      );

    }
  }
}