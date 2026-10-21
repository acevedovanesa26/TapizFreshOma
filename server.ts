import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to get Brevo API key
function getBrevoKey(clientKey?: string): string {
  if (clientKey && clientKey.trim().length > 10) return clientKey.trim();
  return (
    process.env.BREVO_API_KEY ||
    process.env.VITE_BREVO_API_KEY ||
    process.env.BREVO_SMTP_KEY ||
    ''
  ).trim();
}

// API Endpoint to send emails via Brevo server-side (avoids browser CORS issues)
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      toEmail,
      toName,
      subject,
      htmlContent,
      apiKey: clientApiKey,
      senderEmail: clientSenderEmail,
      senderName: clientSenderName,
    } = req.body;

    const apiKey = getBrevoKey(clientApiKey);

    if (!toEmail || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos (toEmail, subject, htmlContent)',
      });
    }

    if (!apiKey) {
      console.warn('Advertencia: No hay BREVO_API_KEY configurada.');
      return res.status(400).json({
        success: false,
        error: 'Clave de Brevo no configurada en las variables de entorno ni en Ajustes.',
      });
    }

    const senderEmail = (
      clientSenderEmail ||
      process.env.BREVO_SENDER_EMAIL ||
      'tapizoma2026@gmail.com'
    ).trim();

    const senderName = (
      clientSenderName ||
      process.env.BREVO_SENDER_NAME ||
      'Tapiz Fresh Bogotá'
    ).trim();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName || toEmail }],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Error desde Brevo API:', data);
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Error al enviar correo con Brevo',
        details: data,
      });
    }

    return res.json({ success: true, messageId: data.messageId });
  } catch (error: any) {
    console.error('Error interno al enviar correo:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { apiKey: clientApiKey, targetEmail, senderEmail: clientSenderEmail } = req.body;
    const apiKey = getBrevoKey(clientApiKey);
    const to = (targetEmail || 'tapizoma2026@gmail.com').trim();
    const sender = (
      clientSenderEmail ||
      process.env.BREVO_SENDER_EMAIL ||
      'tapizoma2026@gmail.com'
    ).trim();

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Ingresa primero tu clave API de Brevo para poder realizar la prueba.',
      });
    }

    const testHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #78BDC4; border-radius: 16px;">
        <h2 style="color: #2F6F77; margin-top: 0;">🫧 ¡Conexión con Brevo Exitosa!</h2>
        <p style="color: #334155; font-size: 14px;">Este es un correo de prueba enviado desde tu panel administrativo de <strong>Tapiz Fresh Bogotá</strong>.</p>
        <div style="background-color: #EBF7F8; padding: 12px 16px; border-radius: 10px; margin: 16px 0;">
          <p style="margin: 0; color: #2F6F77; font-size: 13px;">✅ <strong>Estado:</strong> Tu sistema de correos está 100% operativo.</p>
          <p style="margin: 4px 0 0 0; color: #64748B; font-size: 12px;">Los códigos de acceso y notificaciones de clientes llegarán a tu bandeja.</p>
        </div>
        <p style="color: #94A3B8; font-size: 11px; margin-bottom: 0;">Tapiz Fresh Bogotá • Lavado Profesional a Domicilio</p>
      </div>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Tapiz Fresh Bogotá', email: sender },
        to: [{ email: to, name: 'Omaira Motato' }],
        subject: '🫧 Prueba Exitosa: Sistema de Correos Tapiz Fresh Bogotá',
        htmlContent: testHtml,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Error de autenticación con Brevo. Revisa tu clave y el remitente.',
        details: data,
      });
    }

    return res.json({
      success: true,
      message: `¡Correo de prueba enviado con éxito a ${to}! Revisa tu bandeja de entrada o spam.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error de conexión con el servidor',
    });
  }
});

// Serve frontend in production or mount vite middlewares in dev
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Mount Vite dev server middlewares
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Tapiz Fresh corriendo en http://0.0.0.0:${PORT}`);
});
