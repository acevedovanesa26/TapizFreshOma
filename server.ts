import express from 'express';
import path from 'path';
import fs from 'fs';
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
  if (clientKey && clientKey.trim().length > 10) return clientKey.trim().replace(/^["']|["']$/g, '');
  const serverConfig = loadServerConfig();
  if (serverConfig.brevoApiKey && serverConfig.brevoApiKey.trim().length > 10) {
    return serverConfig.brevoApiKey.trim().replace(/^["']|["']$/g, '');
  }
  return (
    process.env.BREVO_API_KEY ||
    process.env.VITE_BREVO_API_KEY ||
    process.env.BREVO_SMTP_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');
}

// Config persistence on server disk so settings persist across all devices and IPs
const CONFIG_FILE = path.resolve(__dirname, 'server-config.json');
const DATA_FILE = path.resolve(__dirname, 'server-data.json');

interface ServerConfig {
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

function loadServerConfig(): ServerConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('No se pudo leer server-config.json:', e);
  }
  return {};
}

function saveServerConfig(cfg: ServerConfig): void {
  try {
    const current = loadServerConfig();
    const updated = { ...current, ...cfg };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando server-config.json:', e);
  }
}

// Endpoint to read active server config for any connecting device or IP
app.get('/api/config', (_req, res) => {
  const cfg = loadServerConfig();
  const supabaseUrl = cfg.supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = cfg.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const brevoKey = getBrevoKey();
  const brevoSenderEmail = cfg.brevoSenderEmail || process.env.BREVO_SENDER_EMAIL || 'tapizoma2026@gmail.com';
  const brevoSenderName = cfg.brevoSenderName || process.env.BREVO_SENDER_NAME || 'Tapiz Fresh Bogotá';

  return res.json({
    supabaseUrl,
    supabaseAnonKey,
    brevoSenderEmail,
    brevoSenderName,
    isBrevoConfigured: Boolean(brevoKey && brevoKey.length > 10),
    isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')),
  });
});

// Endpoint to update server config from the admin dashboard (persists to server disk and process)
app.post('/api/config', (req, res) => {
  try {
    const { brevoApiKey, brevoSenderEmail, brevoSenderName, supabaseUrl, supabaseAnonKey } = req.body;
    const cfgToSave: ServerConfig = {};

    if (typeof brevoApiKey === 'string') {
      cfgToSave.brevoApiKey = brevoApiKey.trim().replace(/^["']|["']$/g, '');
    }
    if (typeof brevoSenderEmail === 'string') {
      cfgToSave.brevoSenderEmail = brevoSenderEmail.trim();
    }
    if (typeof brevoSenderName === 'string') {
      cfgToSave.brevoSenderName = brevoSenderName.trim();
    }
    if (typeof supabaseUrl === 'string') {
      cfgToSave.supabaseUrl = supabaseUrl.trim();
    }
    if (typeof supabaseAnonKey === 'string') {
      cfgToSave.supabaseAnonKey = supabaseAnonKey.trim();
    }

    saveServerConfig(cfgToSave);

    return res.json({
      success: true,
      message: 'Configuración guardada en el servidor para todos los dispositivos e IPs.',
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Centralized backup and synchronization store for all devices/IPs
app.get('/api/sync', (_req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return res.json(JSON.parse(raw));
    }
    return res.json({ clientes: [], cotizaciones: [], citas: [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/sync', (req, res) => {
  try {
    const { clientes, cotizaciones, citas } = req.body;
    let existing: any = { clientes: [], cotizaciones: [], citas: [] };
    if (fs.existsSync(DATA_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      } catch {}
    }

    // Merge by id
    const mergeArrays = (prev: any[] = [], incoming: any[] = []) => {
      const map = new Map<string, any>();
      prev.forEach((item) => item?.id && map.set(item.id, item));
      incoming.forEach((item) => item?.id && map.set(item.id, item));
      return Array.from(map.values());
    };

    const updated = {
      clientes: mergeArrays(existing.clientes, clientes),
      cotizaciones: mergeArrays(existing.cotizaciones, cotizaciones),
      citas: mergeArrays(existing.citas, citas),
      lastSync: new Date().toISOString(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return res.json({ success: true, count: updated.clientes.length });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Helper to format Brevo error into human-understandable guidance
function formatBrevoError(data: any): string {
  if (data?.code === 'unauthorized' || data?.message === 'Key not found') {
    return 'Brevo rechazó la clave con el error "Key not found". En Brevo existen 2 tipos de claves: Debes usar una "Clave API" (empieza por "xkeysib-"), NO una "Clave SMTP". Ve a brevo.com → Menú superior derecho → "SMTP y API" → Pestaña "Claves API" (no la pestaña Claves SMTP) → Genera una nueva Clave API v3 y pégala en Configuración.';
  }
  if (data?.message?.includes('sender') || data?.code === 'invalid_parameter') {
    return `Error en el remitente de Brevo (${data.message}). Asegúrate de que el Correo Remitente configurado esté validado en tu cuenta de Brevo (ej: omairamotato28@gmail.com o tapizoma2026@gmail.com).`;
  }
  return data?.message || 'Error al comunicarse con la API de Brevo.';
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

    const cfg = loadServerConfig();
    const senderEmail = (
      clientSenderEmail ||
      cfg.brevoSenderEmail ||
      process.env.BREVO_SENDER_EMAIL ||
      'tapizoma2026@gmail.com'
    ).trim();

    const senderName = (
      clientSenderName ||
      cfg.brevoSenderName ||
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
      const friendlyError = formatBrevoError(data);
      return res.status(response.status).json({
        success: false,
        error: friendlyError,
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

// Test email endpoint with instant diagnostic report
app.post('/api/test-email', async (req, res) => {
  try {
    const { apiKey: clientApiKey, targetEmail, senderEmail: clientSenderEmail } = req.body;
    const apiKey = getBrevoKey(clientApiKey);
    const cfg = loadServerConfig();
    const to = (targetEmail || 'tapizoma2026@gmail.com').trim();
    const sender = (
      clientSenderEmail ||
      cfg.brevoSenderEmail ||
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #78BDC4; border-radius: 16px; background: #ffffff;">
        <h2 style="color: #2F6F77; margin-top: 0;">🫧 ¡Conexión con Brevo Exitosa!</h2>
        <p style="color: #334155; font-size: 14px;">Este es un correo de prueba enviado desde tu panel administrativo de <strong>Tapiz Fresh Bogotá</strong>.</p>
        <div style="background-color: #EBF7F8; padding: 12px 16px; border-radius: 10px; margin: 16px 0;">
          <p style="margin: 0; color: #2F6F77; font-size: 13px;">✅ <strong>Estado:</strong> Tu sistema de correos está 100% operativo.</p>
          <p style="margin: 4px 0 0 0; color: #64748B; font-size: 12px;">Los códigos de acceso y notificaciones de clientes llegarán a tu bandeja sin inconvenientes.</p>
        </div>
        <p style="color: #94A3B8; font-size: 11px; margin-bottom: 0;">Tapiz Fresh Bogotá • Lavado Profesional de Muebles a Domicilio</p>
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
      const friendlyError = formatBrevoError(data);
      return res.status(response.status).json({
        success: false,
        error: friendlyError,
        details: data,
      });
    }

    return res.json({
      success: true,
      message: `¡Excelente! Correo de prueba enviado con éxito a ${to}. Revisa tu bandeja de entrada o spam.`,
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
