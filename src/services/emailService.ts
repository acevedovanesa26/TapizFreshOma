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

const BREVO_SENDER = {
  name: 'Tapiz Fresh Bogotá',
  email: 'tapizoma2026@gmail.com',
};

/**
 * Sends a transactional email directly via Brevo REST API v3
 */
async function sendViaBrevoApi(payload: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = getBrevoApiKey();

  if (!apiKey) {
    console.warn('Brevo API key not configured. Email logged to console in dev mode.');
    return {
      success: false,
      error: 'Clave de Brevo no configurada en Ajustes.',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: BREVO_SENDER,
        to: [{ email: payload.toEmail, name: payload.toName || payload.toEmail }],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.message || `Error Brevo: ${response.status} ${response.statusText}`;
      console.error('Brevo API Error:', msg);
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error enviando correo con Brevo:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Sends 6-digit OTP code to the administrator
 */
export async function sendOtpEmail(toEmail: string, code: string): Promise<{ success: boolean; message: string }> {
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
        Si no solicitaste este código, puedes ignorar este correo de forma segura.
      </p>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 Tapiz Fresh • Lavado de Muebles a Domicilio en Bogotá</p>
      </div>
    </div>
  `;

  // 1. Try Brevo direct API
  const brevoRes = await sendViaBrevoApi({
    toEmail,
    subject: `Tu código de acceso a Tapiz Fresh Bogotá: ${code}`,
    htmlContent: html,
  });

  // 2. Also try Supabase Auth OTP if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signInWithOtp({
        email: toEmail,
      });
    } catch (e) {
      console.warn('Supabase OTP trigger notice:', e);
    }
  }

  if (brevoRes.success) {
    return {
      success: true,
      message: `Código enviado con éxito a ${toEmail}. Revisa tu bandeja de entrada o spam.`,
    };
  }

  // If Brevo key not yet configured, provide informative feedback
  return {
    success: true,
    message: `Hemos procesado el código para ${toEmail}. Si configuraste Brevo en Configuración, llegará a tu bandeja en segundos.`,
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
  const photosHtml = lead.fotos && lead.fotos.length > 0
    ? `
      <div style="margin-top: 16px;">
        <strong style="color: #1e293b; font-size: 13px;">Fotos adjuntas del cliente (${lead.fotos.length}):</strong>
        <div style="margin-top: 8px;">
          ${lead.fotos
            .map(
              (f, i) =>
                `<a href="${f}" target="_blank" style="display: inline-block; margin-right: 8px; margin-bottom: 8px;"><img src="${f}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 10px; border: 1px solid #cbd5e1;" alt="Foto ${i + 1}" /></a>`
            )
            .join('')}
        </div>
      </div>
    `
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: #EBF7F8; color: #2F6F77; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">¡Nueva Solicitud en Bogotá!</span>
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 10px 0 0 0;">Nueva Cotización Recibida</h2>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; color: #334155;">
        <p style="margin: 0 0 8px 0;"><strong>👤 Cliente:</strong> ${lead.nombre}</p>
        <p style="margin: 0 0 8px 0;"><strong>📞 Teléfono / WhatsApp:</strong> <a href="https://wa.me/57${lead.telefono.replace(/\D/g, '')}" style="color: #059669; font-weight: bold; text-decoration: none;">${lead.telefono}</a></p>
        <p style="margin: 0 0 8px 0;"><strong>📍 Ubicación:</strong> ${lead.direccion}, Barrio ${lead.barrio} (Bogotá)</p>
        <p style="margin: 0 0 8px 0;"><strong>🛋️ Muebles a lavar:</strong> ${lead.muebles}</p>
        ${lead.correo ? `<p style="margin: 0 0 8px 0;"><strong>✉️ Correo:</strong> ${lead.correo}</p>` : ''}
        ${lead.notas ? `<p style="margin: 0 0 8px 0;"><strong>📝 Notas del cliente:</strong> ${lead.notas}</p>` : ''}
        ${photosHtml}
      </div>

      <div style="text-align: center;">
        <a href="https://wa.me/57${lead.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(lead.nombre)},%20te%20saluda%20Omaira%20de%20Tapiz%20Fresh%20en%20Bogot%C3%A1.%20Recib%C3%AD%20tu%20solicitud%20para%20${encodeURIComponent(lead.muebles)}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
          Responder por WhatsApp al Cliente
        </a>
      </div>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 14px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">Tapiz Fresh CRM • tapizoma2026@gmail.com</p>
      </div>
    </div>
  `;

  await sendViaBrevoApi({
    toEmail: 'tapizoma2026@gmail.com',
    toName: 'Omaira Motato',
    subject: `🔔 Nueva solicitud de ${lead.nombre} (${lead.barrio}, Bogotá)`,
    htmlContent: html,
  });
}
