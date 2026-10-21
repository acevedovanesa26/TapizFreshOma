import { supabase, isSupabaseConfigured } from './supabase';

// Get Brevo API key from env or localStorage
export function getBrevoApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('tapiz_brevo_api_key');
    if (local && local.trim().length > 10) return local.trim();
  }
  return import.meta.env.VITE_BREVO_API_KEY || '';
}

export function saveBrevoApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tapiz_brevo_api_key', key.trim());
  }
}

// Get Brevo Sender Email (the email address authorized in Brevo)
export function getBrevoSenderEmail(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('tapiz_brevo_sender_email');
    if (local && local.trim().includes('@')) return local.trim();
  }
  return import.meta.env.VITE_BREVO_SENDER_EMAIL || 'tapizoma2026@gmail.com';
}

export function saveBrevoSenderEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tapiz_brevo_sender_email', email.trim());
  }
}

/**
 * Sends a transactional email through the backend proxy /api/send-email
 * (prevents browser CORS errors when talking to Brevo)
 */
async function sendViaBrevoApi(payload: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = getBrevoApiKey();
  const senderEmail = getBrevoSenderEmail();

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        toEmail: payload.toEmail,
        toName: payload.toName || payload.toEmail,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        apiKey: apiKey || undefined,
        senderEmail,
        senderName: 'Tapiz Fresh Bogotá',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn('Backend send-email error:', data);
      return {
        success: false,
        error: data.error || 'Error al conectar con el servicio de correo.',
      };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Error llamando /api/send-email:', err);
    return {
      success: false,
      error: err.message || 'Error de red al enviar correo.',
    };
  }
}

/**
 * Tests sending a sample email to verify Brevo credentials directly
 */
export async function testBrevoConnection(
  targetEmail: string
): Promise<{ success: boolean; message: string }> {
  const apiKey = getBrevoApiKey();
  const senderEmail = getBrevoSenderEmail();

  try {
    const response = await fetch('/api/test-email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        targetEmail,
        senderEmail,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error de verificación con Brevo.',
      };
    }

    return {
      success: true,
      message: data.message || `¡Correo de prueba enviado con éxito a ${targetEmail}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error de conexión con el servidor.',
    };
  }
}

/**
 * Sends 6-digit OTP code to the administrator.
 * Never outputs sensitive configuration errors or codes to the public interface.
 */
export async function sendOtpEmail(
  toEmail: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #78BDC4; border-radius: 14px; color: #ffffff; font-size: 20px; font-weight: 800; line-height: 48px;">TF</div>
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 800; margin: 12px 0 2px 0;">Tapiz Fresh Bogotá</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Panel de Administración</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hola,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Tu código de acceso seguro al panel administrativo es:</p>
      <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; background-color: #ebf7f8; color: #2f6f77; font-size: 34px; font-weight: 900; letter-spacing: 8px; padding: 14px 28px; border-radius: 14px; border: 2px dashed #78BDC4;">
          ${code}
        </span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
        ⏱️ Este código vence en <strong>10 minutos</strong>.<br/>
        Por seguridad, nunca compartas este código con nadie.
      </p>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 Tapiz Fresh • Lavado Profesional de Muebles a Domicilio en Bogotá</p>
      </div>
    </div>
  `;

  // 1. Try Brevo via backend proxy
  sendViaBrevoApi({
    toEmail,
    subject: `Tu código de acceso a Tapiz Fresh Bogotá: ${code}`,
    htmlContent: html,
  }).catch((e) => console.warn('Brevo send background notice:', e));

  // 2. Also trigger Supabase Auth OTP if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signInWithOtp({
        email: toEmail,
      });
    } catch (e) {
      console.warn('Supabase OTP trigger notice:', e);
    }
  }

  // Uniform, confidential message: never expose internal keys, debug state, or codes on UI
  return {
    success: true,
    message: 'Se ha enviado un código de acceso de 6 dígitos a tu correo registrado. Revisa tu bandeja de entrada o la carpeta de spam.',
  };
}

/**
 * Sends a notification email to Omaira (tapizoma2026@gmail.com) whenever a new client
 * sends a quote or contact form
 */
export async function sendLeadNotificationToOmaira(lead: {
  nombre: string;
  telefono: string;
  correo?: string;
  direccion: string;
  barrio: string;
  muebles: string;
  fotos?: string[];
  notas?: string;
}): Promise<void> {
  const photosHtml =
    lead.fotos && lead.fotos.length > 0
      ? `
      <div style="margin-top: 16px;">
        <strong style="color: #1e293b; font-size: 13px;">Fotos adjuntas del mueble (${lead.fotos.length}):</strong>
        <div style="margin-top: 8px;">
          ${lead.fotos
            .map(
              (f, i) =>
                `<a href="${f}" target="_blank" style="display: inline-block; margin-right: 8px; margin-bottom: 8px; color: #4F9DA6; font-size: 12px; font-weight: bold; text-decoration: underline;">Ver Foto #${i + 1}</a>`
            )
            .join(' • ')}
        </div>
      </div>
    `
      : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px;">
      <div style="background: #EBF7F8; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="color: #2F6F77; font-size: 18px; margin: 0; font-weight: 800;">
          🫧 ¡Nueva Solicitud de Cotización en Bogotá!
        </h2>
        <p style="color: #4F9DA6; font-size: 12px; margin: 4px 0 0 0;">
          Recibida a través del sitio web de Tapiz Fresh
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Cliente:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${lead.nombre}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Teléfono:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">
            <a href="tel:${lead.telefono}" style="color: #4F9DA6; text-decoration: none;">${lead.telefono}</a> 
            (<a href="https://wa.me/57${lead.telefono.replace(/\D/g, '')}" target="_blank" style="color: #10B981; font-weight: bold;">WhatsApp</a>)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Barrio:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${lead.barrio} (Bogotá)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Dirección:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.direccion}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Muebles:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${lead.muebles}</td>
        </tr>
        ${
          lead.notas
            ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Notas:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.notas}</td>
        </tr>
        `
            : ''
        }
      </table>

      ${photosHtml}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
        <a href="https://wa.me/57${lead.telefono.replace(/\D/g, '')}" target="_blank" style="display: inline-block; background: #10B981; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px;">
          Abrir Chat de WhatsApp con el Cliente
        </a>
      </div>
    </div>
  `;

  // Send to Omaira's email
  sendViaBrevoApi({
    toEmail: 'tapizoma2026@gmail.com',
    toName: 'Omaira Motato',
    subject: `🫧 Nueva Solicitud en Bogotá: ${lead.nombre} (${lead.barrio})`,
    htmlContent: html,
  }).catch((e) => console.warn('Lead notification notice:', e));
}
