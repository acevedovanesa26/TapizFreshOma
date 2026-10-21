# 🫧 Tapiz Fresh Bogotá - CRM, Agenda & Cotizaciones con Foto

Sistema web y panel de administración para **Tapiz Fresh**, especializado en el lavado y desmanchado de sofás, colchones y sillas de comedor a domicilio en **Bogotá**.

- **Propietaria:** Omaira Motato
- **Teléfono y WhatsApp Oficial:** `321 991 8147` (+57 321 991 8147)
- **Correo Administrador:** `tapizoma2026@gmail.com`
- **Ruta del Panel Administrativo:** `/admin`

---

## 🚀 1. Cómo Conectar tu Proyecto de Supabase

Ya creaste tu proyecto en Supabase. Ahora conéctalo siguiendo estos pasos:

### Paso A: Ejecutar el script de base de datos
1. Inicia sesión en tu cuenta de [Supabase](https://supabase.com) y entra a tu proyecto.
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Abre el archivo `schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor de Supabase.
4. Pulsa el botón **Run** (Ejecutar).
   - Creará automáticamente las tablas: `administradores`, `clientes`, `cotizaciones`, `citas`, `seguimientos`.
   - Precargará a `tapizoma2026@gmail.com` como `propietaria`.
   - Activará la seguridad **Row Level Security (RLS)**.

### Paso B: Copiar tus credenciales de Supabase
1. En Supabase, ve a **Project Settings** (el icono de engranaje abajo a la izquierda) → **API**.
2. Copia tu **Project URL** (ejemplo: `https://xyzabc.supabase.co`) y tu **anon public key**.
3. Puedes ingresarlas en el panel de administración en **/admin** → **Configuración** → **Conectar Supabase, Brevo y GitHub**.

---

## ✉️ 2. Cómo Conectar Brevo (SMTP) para Enviar Correos con Buen Formato

Para que los códigos de 6 dígitos para entrar a `/admin` lleguen con la marca de Tapiz Fresh y directo a la bandeja de entrada:

### Paso A: Obtener credenciales SMTP en Brevo
1. Inicia sesión en [Brevo](https://www.brevo.com).
2. Ve al menú superior derecho, haz clic en tu nombre → **SMTP & API** (o ve a **Transactional** → **Settings** → **Configuration**).
3. Verás tus datos de conexión SMTP:
   - **Host SMTP:** `smtp-relay.brevo.com`
   - **Puerto:** `587`
   - **Login / Usuario:** Tu correo de Brevo.
   - **Master Password / Clave SMTP:** Genera una nueva clave SMTP y cópiala.

### Paso B: Guardar SMTP en Supabase
1. En tu proyecto de **Supabase**, ve a **Project Settings** → **Authentication**.
2. Baja hasta **SMTP Settings** y activa la opción **Enable Custom SMTP**.
3. Rellena los campos:
   - **Sender Email:** `tapizoma2026@gmail.com`
   - **Sender Name:** `Tapiz Fresh Bogotá`
   - **Host:** `smtp-relay.brevo.com`
   - **Port:** `587`
   - **User:** (Tu usuario de Brevo)
   - **Password:** (Tu clave SMTP de Brevo)
4. Haz clic en **Save**.

### Paso C: Plantilla de Correo con Buen Diseño
En Supabase, ve a **Authentication** → **Email Templates** → **Magic Link / Confirmation Code**:
- **Subject (Asunto):** `Tu código de acceso a Tapiz Fresh Bogotá`
- **Body (Cuerpo del mensaje):** Pega este código HTML:

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; width: 48px; height: 48px; background: #78BDC4; border-radius: 14px; color: #ffffff; font-size: 20px; font-weight: 800; line-height: 48px; text-align: center;">TF</div>
    <h2 style="color: #1e293b; font-size: 22px; font-weight: 800; margin: 12px 0 2px 0;">Tapiz Fresh Bogotá</h2>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Panel de Administración</p>
  </div>

  <p style="color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Hola Omaira,</p>
  <p style="color: #334155; font-size: 15px; line-height: 1.5;">Tu código de acceso seguro al panel es:</p>

  <div style="text-align: center; margin: 28px 0;">
    <span style="display: inline-block; background-color: #ebf7f8; color: #2f6f77; font-size: 32px; font-weight: 900; letter-spacing: 6px; padding: 14px 28px; border-radius: 14px; border: 2px dashed #78BDC4;">
      {{ .Token }}
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
```

---

## 🐙 3. Cómo Subir el Proyecto a GitHub

Sigue estos comandos en tu terminal para publicar el repositorio:

```bash
# 1. Inicializa el repositorio local (si no lo has hecho)
git init

# 2. Agrega todos los archivos
git add .

# 3. Guarda tu primer commit
git commit -m "feat: Tapiz Fresh - CRM, Agenda y Cotizador con Foto Bogotá"

# 4. En GitHub, crea un repositorio vacío (ej: tapiz-fresh) y conecta la rama main
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tapiz-fresh.git

# 5. Sube todos los archivos
git push -u origin main
```

---

## 📱 4. Flujo de Cotizaciones con Foto en Bogotá

1. El cliente entra a la web y selecciona el tipo de mueble que tiene (Sofá en L, 3 puestos, Colchón, etc.).
2. Sube la foto del mueble directamente desde su celular o cámara.
3. Escribe su nombre, teléfono, dirección y barrio en Bogotá.
4. Al pulsar **"Solicitar Cotización con mi Foto"**:
   - Se crea automáticamente el cliente en el CRM (vinculando por teléfono/correo para no duplicar).
   - Se genera una cotización pendiente con la foto visible en `/admin`.
   - Se abre WhatsApp (`321 991 8147`) con el mensaje listo para que el cliente le envíe la foto a Omaira.
