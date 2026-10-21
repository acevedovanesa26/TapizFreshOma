# 🫧 Tapiz Fresh Bogotá - CRM, Agenda & Cotizaciones con Foto

Sistema web y panel de administración para **Tapiz Fresh**, especializado en el lavado y desmanchado de sofás, colchones y sillas de comedor a domicilio en **Bogotá**.

- **Propietaria:** Omaira Motato
- **Teléfono y WhatsApp Oficial:** `321 991 8147` (+57 321 991 8147)
- **Correo Administrador:** `tapizoma2026@gmail.com`
- **Ruta del Panel Administrativo:** `/admin`

---

## 🛠️ 1. Solución al Error en Render (`Publish directory dist does not exist!`)

Si al desplegar en Render te apareció este error:
```text
==> Running build command 'bun install'...
==> Publish directory dist does not exist!
==> Build failed 😞
```

### ¿Por qué ocurre?
Porque Render ejecutó únicamente la instalación (`bun install` o `npm install`), pero **no compiló la aplicación** con Vite (`npm run build`). Al no compilarse, la carpeta `dist/` no se crea.

### ¿Cómo solucionarlo en Render? (Paso a paso)
1. Entra a tu panel de [Render Dashboard](https://dashboard.render.com).
2. Haz clic en tu servicio o sitio web (**TapizFreshOma**).
3. En el menú lateral izquierdo, haz clic en **Settings** (Configuración).
4. Busca la sección **Build & Deploy**:
   - **Build Command:** Cambia lo que haya por:
     ```bash
     npm install && npm run build
     ```
     *(O si Render usa Bun: `bun install && bun run build`)*
   - **Publish Directory:** Asegúrate de que diga:
     ```text
     dist
     ```
   - Si creaste un **Web Service (Node)**:
     - **Start Command:** Pon:
       ```bash
       npm run start
       ```
5. Haz clic en **Save Changes** (Guardar cambios).
6. Arriba a la derecha pulsa **Manual Deploy** → **Deploy latest commit**.
¡Listo! La carpeta `dist` se creará y tu página quedará en línea.

---

## ✉️ 2. ¿Qué colocar en BREVO_SENDER_EMAIL y BREVO_SENDER_NAME?

En tus variables de entorno o en Render:

- **`BREVO_SENDER_EMAIL`**:  
  Coloca: `tapizoma2026@gmail.com`  
  *(**Importante:** En tu cuenta de Brevo, ve a **Senders & IP** y verifica que `tapizoma2026@gmail.com` esté agregado y confirmado como remitente autorizado).*
  
- **`BREVO_SENDER_NAME`**:  
  Coloca: `Tapiz Fresh Bogotá`

- **`BREVO_API_KEY`**:  
  Tu clave API que empieza por `xkeysib-...` (obtenida en Brevo → SMTP & API → API Keys).

> **Consejo:** Desde tu panel **/admin** → **Configuración** → **Conexión de Correo y Base de Datos**, puedes ingresar tu clave y pulsar el botón **"Probar Envío de Correo Ahora Mismo"** para verificar en 2 segundos si el correo llega a tu bandeja.

---

## 🗄️ 3. Conexión de Supabase (Sincronización en Tiempo Real)

### Paso A: Ejecutar el script SQL
1. Inicia sesión en [Supabase](https://supabase.com) y entra a tu proyecto.
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Copia todo el contenido del archivo `schema.sql` de este repositorio y pégalo allí.
4. Pulsa **Run** (Ejecutar). Creará las tablas con seguridad y UUIDs compatibles.

### Paso B: Obtener tus claves
1. En Supabase, ve a **Project Settings** (engranaje) → **API**.
2. Copia:
   - **Project URL:** `https://xyzabc.supabase.co`
   - **anon public key:** `eyJhbGciOi...`
3. En Render (o en tu archivo `.env`), agrégalas como:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   *(También puedes guardarlas directamente desde **/admin** → **Configuración**).*

---

## 📸 4. Cambiar Fotos de la Página desde el Celular o PC

En el panel de administración (**/admin**):
1. Ve a la pestaña **Configuración** → **Cambiar Fotos de la Página**.
2. Podrás cambiar con un solo clic:
   - **Foto principal del inicio (Bienvenida):** Selecciona cualquier foto de tu galería o pega una URL.
   - **Fotos de los muebles en el cotizador:** Sofá en L, Sofá de 3 y 2 puestos, Colchones King/Doble y Sillas.
   - **Galería de Antes y Después (Carrusel):** Sube la foto del antes y la foto del después de tus trabajos reales con su título.
3. Los cambios se actualizan automáticamente en toda la página web.

---

## 🔒 5. Seguridad del Administrador (/admin)

- Administrador principal predeterminado: `tapizoma2026@gmail.com`.
- **Código por correo (OTP):** Por seguridad, el código de 6 dígitos **únicamente se envía al correo registrado** y vence en 10 minutos. Nunca se muestra en pantalla.
- **Bloqueo por intentos:** Máximo 5 intentos fallidos (bloqueo automático temporal por 15 minutos).
- **Cierre automático:** La sesión se cierra tras 30 minutos de inactividad para proteger los datos de tus clientes.
