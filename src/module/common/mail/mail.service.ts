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
  expirationText?: string;
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

    // Construir URL de verificación
    const url = this.buildFrontendUrl(
      'verify-account',
      token,
    );

    // Generar HTML del correo
    const html = this.buildMailTemplate({

      title: '¡Estás a un paso de comenzar!',

      description: `
        <p
          style="
            margin:0 0 14px 0;
          "
        >
          Gracias por registrarte en
          <strong style="color:#ffffff;">
            PokéCircuit
          </strong>.
        </p>

        <p
          style="
            margin:0;
          "
        >
          Confirma tu correo electrónico para activar
          tu cuenta y comenzar a participar en
          <strong style="color:#ffffff;">
            torneos y rankings
          </strong>.
        </p>
      `,

      buttonText: 'Verificar mi cuenta →',

      buttonColor: '#facc15',

      url,

      warning: `
        <p
          style="
            margin:0 0 12px 0;
            color:#94a3b8;
          "
        >
          Si el enlace expira, podrás solicitar uno nuevo
          desde la plataforma.
        </p>

        <p
          style="
            margin:0;
            color:#64748b;
          "
        >
          Si no creaste una cuenta en
          <strong>PokéCircuit</strong>,
          puedes ignorar este mensaje.
        </p>
      `,
      expirationText: 'Enlace válido durante 24 horas',
      footerText: 'Todos los derechos reservados',

    });

    // Versión en texto plano
    const text = `
  PokéCircuit
  Plataforma de torneos competitivos

  ¡Estás a un paso de comenzar!

  Gracias por registrarte en PokéCircuit.

  Confirma tu correo electrónico para activar tu cuenta
  y comenzar a participar en torneos y rankings.

  VERIFICAR MI CUENTA:
  ${url}

  Este enlace es válido durante 24 horas.

  Si el enlace expira, podrás solicitar uno nuevo
  desde la plataforma PokéCircuit.

  Si no creaste una cuenta en PokéCircuit,
  puedes ignorar este mensaje.

  © ${new Date().getFullYear()} PokéCircuit
  Todos los derechos reservados
    `.trim();

    // Enviar correo
    await this.sendMail({
      to,
      subject: 'Activa tu cuenta | PokéCircuit',
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

    // Construir URL para restablecer contraseña
    const url = this.buildFrontendUrl(
      'reset-password',
      token,
    );

    // Generar HTML del correo
    const html = this.buildMailTemplate({

      title: 'Restablece tu contraseña',

      description: `
        <p
          style="
            margin:0 0 14px 0;
          "
        >
          Recibimos una solicitud para cambiar
          la contraseña de tu cuenta en
          <strong style="color:#ffffff;">
            PokéCircuit
          </strong>.
        </p>

        <p
          style="
            margin:0;
          "
        >
          Si realizaste esta solicitud, haz clic
          en el siguiente botón para crear
          una nueva contraseña y recuperar
          el acceso a tu cuenta.
        </p>
      `,

      buttonText: 'Restablecer contraseña →',

      buttonColor: '#ef4444',

      url,

      warning: `
        <p
          style="
            margin:0 0 12px 0;
            color:#94a3b8;
          "
        >
          <strong style="color:#fca5a5;">
            Aviso de seguridad
          </strong>
        </p>

        <p
          style="
            margin:0 0 12px 0;
            color:#94a3b8;
          "
        >
          Este enlace es temporal y solo debe
          utilizarse para restablecer tu contraseña.
        </p>

        <p
          style="
            margin:0;
            color:#64748b;
          "
        >
          Si no solicitaste este cambio,
          puedes ignorar este mensaje.
          Tu contraseña actual seguirá siendo válida.
        </p>
      `,
      expirationText: 'Enlace válido durante 1 hora',
      footerText: 'Seguridad y Competencia',

    });

    // Versión en texto plano
    const text = `
  PokéCircuit
  Plataforma de torneos competitivos

  RESTABLECE TU CONTRASEÑA

  Recibimos una solicitud para cambiar
  la contraseña de tu cuenta en PokéCircuit.

  Si realizaste esta solicitud, utiliza
  el siguiente enlace para crear
  una nueva contraseña:

  ${url}

  AVISO DE SEGURIDAD

  Este enlace es temporal y solo debe utilizarse
  para restablecer tu contraseña.

  Si no solicitaste este cambio,
  puedes ignorar este mensaje.

  Tu contraseña actual seguirá siendo válida.

  © ${new Date().getFullYear()} PokéCircuit
  Seguridad y Competencia
    `.trim();

    // Enviar correo
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
    expirationText = '',
    footerText = 'Todos los derechos reservados',
  } = options;

  const safeUrl = this.escapeHtml(url);
  const safeTitle = this.escapeHtml(title);
  const safeButtonText = this.escapeHtml(buttonText);
  const safeFooterText = this.escapeHtml(footerText);

  const year = new Date().getFullYear();

  const textButtonColor =
    buttonColor.toLowerCase() === '#facc15'
      ? '#0f172a'
      : '#ffffff';

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
        -webkit-text-size-adjust:100%;
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
          border-collapse:collapse;
        "
      >
        <tr>
          <td
            align="center"
            style="padding:30px 12px;"
          >

            <!-- CONTENEDOR PRINCIPAL -->

            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                width:100%;
                max-width:560px;
                background-color:#1e293b;
                border-radius:14px;
                overflow:hidden;
                border-collapse:separate;
              "
            >

              <!-- LOGO -->

              <tr>
                <td
                  align="center"
                  style="
                    padding:28px 24px 16px 24px;
                  "
                >

                  <img
                    src="https://pokecircuit.com/img/pokecircuit.e21f3a90.png"
                    alt="PokéCircuit"
                    width="145"
                    style="
                      display:block;
                      width:145px;
                      max-width:100%;
                      height:auto;
                      margin:0 auto 16px auto;
                      border:0;
                    "
                  >

                  <p
                    style="
                      margin:0;
                      color:#94a3b8;
                      font-size:13px;
                      line-height:20px;
                      text-align:center;
                    "
                  >
                    Plataforma de torneos competitivos
                  </p>

                </td>
              </tr>

              <!-- SEPARADOR -->

              <tr>
                <td style="padding:8px 32px 0 32px;">

                  <div
                    style="
                      height:1px;
                      background-color:#334155;
                      font-size:1px;
                      line-height:1px;
                    "
                  >
                    &nbsp;
                  </div>

                </td>
              </tr>

              <!-- CONTENIDO -->

              <tr>
                <td
                  style="
                    padding:28px 32px 32px 32px;
                    color:#e2e8f0;
                    font-size:15px;
                    line-height:24px;
                  "
                >

                  <!-- ICONO DE VERIFICACIÓN -->

                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    align="center"
                    style="margin:0 auto 20px auto;"
                  >
                    <tr>
                      <td
                        align="center"
                        valign="middle"
                        width="56"
                        height="56"
                        style="
                          width:56px;
                          height:56px;
                          background-color:#334155;
                          border-radius:50%;
                          color:#facc15;
                          font-size:28px;
                          line-height:56px;
                          text-align:center;
                        "
                      >
                        &#9993;
                      </td>
                    </tr>
                  </table>

                  <!-- TÍTULO -->

                  <h1
                    style="
                      margin:0 0 18px 0;
                      color:#ffffff;
                      font-size:23px;
                      font-weight:bold;
                      line-height:32px;
                      text-align:center;
                    "
                  >
                    ${safeTitle}
                  </h1>

                  <!-- DESCRIPCIÓN -->

                  <div
                    style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:25px;
                      text-align:center;
                    "
                  >
                    ${description}
                  </div>

                  <!-- BOTÓN PRINCIPAL -->

                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    align="center"
                    style="
                      margin:28px auto 12px auto;
                    "
                  >
                    <tr>
                      <td
                        align="center"
                        bgcolor="${buttonColor}"
                        style="
                          background-color:${buttonColor};
                          border-radius:9px;
                        "
                      >

                        <a
                          href="${safeUrl}"
                          target="_blank"
                          style="
                            display:inline-block;
                            padding:15px 32px;
                            background-color:${buttonColor};
                            color:${textButtonColor};
                            font-family:Arial,Helvetica,sans-serif;
                            font-size:16px;
                            font-weight:bold;
                            line-height:20px;
                            text-decoration:none;
                            border-radius:9px;
                            text-align:center;
                          "
                        >
                          ${safeButtonText}
                        </a>

                      </td>
                    </tr>
                  </table>

                  <!-- DURACIÓN DEL ENLACE -->

                  ${
                    expirationText
                      ? `
                        <p
                          style="
                            margin:12px 0 26px 0;
                            color:#94a3b8;
                            font-size:13px;
                            line-height:20px;
                            text-align:center;
                          "
                        >
                          &#9201; ${this.escapeHtml(expirationText)}
                        </p>
                      `
                      : ''
                  }

                  <!-- SEPARADOR -->

                  <div
                    style="
                      height:1px;
                      background-color:#334155;
                      margin:0 0 24px 0;
                      font-size:1px;
                      line-height:1px;
                    "
                  >
                    &nbsp;
                  </div>

                  <!-- ENLACE ALTERNATIVO -->

                  <p
                    style="
                      margin:0 0 10px 0;
                      color:#94a3b8;
                      font-size:13px;
                      line-height:20px;
                      text-align:center;
                    "
                  >
                    ¿El botón no funciona?
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:14px;
                      line-height:22px;
                      text-align:center;
                    "
                  >
                    <a
                      href="${safeUrl}"
                      target="_blank"
                      style="
                        color:#7dd3fc;
                        text-decoration:underline;
                        font-weight:500;
                      "
                    >
                      Abrir enlace de verificación
                    </a>
                  </p>
                  <!-- ADVERTENCIA -->
                  ${
                    warning
                      ? `
                        <div
                          style="
                            margin-top:28px;
                            padding-top:22px;
                            border-top:1px solid #334155;
                            color:#94a3b8;
                            font-size:12px;
                            line-height:19px;
                            text-align:center;
                          "
                        >
                          ${warning}
                        </div>
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
                width:100%;
                max-width:560px;
                margin-top:18px;
              "
            >
              <tr>
                <td
                  align="center"
                  style="
                    padding:0 20px;
                    color:#64748b;
                    font-size:12px;
                    line-height:18px;
                    text-align:center;
                  "
                >
                  © ${year} PokéCircuit · ${safeFooterText}
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