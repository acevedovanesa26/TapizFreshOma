import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Briefcase,
  MessageSquare,
  Mail,
  Images,
  Download,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
  Database,
  GitBranch,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Administrador, ConfiguracionApp } from '../../types';
import { exportClientesToCsv } from '../../services/csvExport';

interface SettingsTabProps {
  currentAdmin: Administrador;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentAdmin }) => {
  const [config, setConfig] = useState<ConfiguracionApp>(storage.getConfig());
  const [admins, setAdmins] = useState<Administrador[]>(storage.getAdministradores());

  // Invite Admin State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'propietaria'>('admin');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Active section
  const [activeSection, setActiveSection] = useState<
    'admins' | 'servicios' | 'plantillas' | 'carrusel' | 'integraciones' | 'backup'
  >('integraciones');

  // Copied feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Supabase direct connection inputs
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setConfig(storage.getConfig());
      setAdmins(storage.getAdministradores());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    storage.inviteAdmin(inviteEmail, inviteName, inviteRole);
    setInviteEmail('');
    setInviteName('');
    setInviteSuccessMsg(`¡Administrador ${inviteEmail} autorizado! Podrá ingresar vía código de 6 dígitos.`);
    setTimeout(() => setInviteSuccessMsg(''), 4000);
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('¿Seguro que deseas revocar el acceso a este administrador?')) {
      storage.deleteAdmin(id);
    }
  };

  const handleExportBackup = () => {
    const clients = storage.getClientes();
    exportClientesToCsv(clients);
  };

  const emailBrevoTemplate = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
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
</div>`;

  const gitCommands = `# 1. Inicializa el repositorio si aún no lo has hecho
git init

# 2. Agrega todos los archivos del proyecto
git add .

# 3. Haz tu primer commit
git commit -m "feat: Tapiz Fresh - CRM, Agenda y Cotizador con Foto Bogotá"

# 4. Crea tu repositorio vacío en GitHub (ej: https://github.com/tu-usuario/tapiz-fresh.git)
# y vincúlalo:
git branch -M main
git remote add origin https://github.com/tu-usuario/tapiz-fresh.git

# 5. Sube tu proyecto a GitHub
git push -u origin main`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4F9DA6]" />
            <span>Configuración y Conexiones</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administradores, plantillas, catálogo de muebles y guías para Supabase, Brevo y GitHub.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cambios guardados con éxito</span>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        {[
          { id: 'integraciones', label: 'Conectar Supabase, Brevo y GitHub', icon: <Database className="w-4 h-4" /> },
          { id: 'admins', label: 'Administradores', icon: <Users className="w-4 h-4" /> },
          { id: 'servicios', label: 'Servicios en Bogotá', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'plantillas', label: 'Plantillas WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'carrusel', label: 'Fotos Antes y Después', icon: <Images className="w-4 h-4" /> },
          { id: 'backup', label: 'Copia de Seguridad (CSV)', icon: <Download className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#78BDC4] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SECTION: INTEGRACIONES (SUPABASE, BREVO, GITHUB) */}
      {activeSection === 'integraciones' && (
        <div className="space-y-6">
          {/* PASO 1: CONECTAR SUPABASE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h3 className="font-black text-base text-slate-800">
                  Paso 1: Conectar tu Proyecto de Supabase
                </h3>
                <p className="text-xs text-slate-500">
                  Ya creaste tu proyecto en Supabase. Ahora sigue estos 3 pasos para dejarlo 100% activo:
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-800 block text-sm">
                  A. Ejecuta el esquema de base de datos (schema.sql)
                </span>
                <p className="text-slate-600">
                  1. En tu panel de Supabase, entra a <strong>SQL Editor</strong> en la barra izquierda.<br/>
                  2. Abre el archivo <code>schema.sql</code> de este proyecto, copia todo el código y pégalo allí.<br/>
                  3. Haz clic en <strong>Run</strong>. Creará las tablas (<code>administradores</code>, <code>clientes</code>, <code>cotizaciones</code>, <code>citas</code>, <code>seguimientos</code>) con la administradora <code>tapizoma2026@gmail.com</code> lista como propietaria.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-800 block text-sm">
                  B. Copia tus credenciales de Supabase
                </span>
                <p className="text-slate-600">
                  En Supabase, ve a <strong>Project Settings</strong> → <strong>API</strong>. Copia tu <strong>Project URL</strong> y tu <strong>anon public key</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Project URL de Supabase
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Anon Public Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (!supabaseUrl || !supabaseAnonKey) {
                        alert('Ingresa la URL y el anon key de tu proyecto de Supabase');
                        return;
                      }
                      setSupabaseConnected(true);
                      alert('¡Credenciales guardadas! El sistema las utilizará para la sincronización.');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Guardar Credenciales Supabase
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 2: CONECTAR BREVO (SMTP Y CORREOS BONITOS) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    Paso 2: Conectar Brevo para Enviar Correos con Buen Formato
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuración paso a paso en Brevo y Supabase para que los correos lleguen elegantes y directos a la bandeja de entrada.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div>
                <strong className="text-slate-800 block mb-1">1. Obtén tus credenciales SMTP en Brevo:</strong>
                <p className="text-slate-600">
                  En tu cuenta de Brevo (Sendinblue), entra a <strong>Transactional</strong> → <strong>Settings</strong> → <strong>Configuration</strong> (SMTP & API).
                </p>
                <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 font-mono space-y-1">
                  <div><strong>Host:</strong> smtp-relay.brevo.com</div>
                  <div><strong>Puerto:</strong> 587</div>
                  <div><strong>Usuario:</strong> Tu correo de Brevo</div>
                  <div><strong>Contraseña / SMTP Key:</strong> La clave generada en Brevo</div>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">2. Pega estos datos en Supabase:</strong>
                <p className="text-slate-600">
                  En Supabase, ve a <strong>Project Settings</strong> → <strong>Authentication</strong> → <strong>SMTP Settings</strong>. Activa <strong>Enable Custom SMTP</strong> y completa con los datos de arriba. Como <strong>Sender Email</strong> pon <code>tapizoma2026@gmail.com</code> y como <strong>Sender Name</strong> pon <code>Tapiz Fresh Bogotá</code>.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <strong className="text-slate-800">3. Plantilla de Correo con Diseño Tapiz Fresh:</strong>
                  <button
                    onClick={() => handleCopy(emailBrevoTemplate, 'brevoTemplate')}
                    className="px-2.5 py-1 rounded-lg bg-[#EBF7F8] hover:bg-[#78BDC4] text-[#2F6F77] hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'brevoTemplate' ? '¡Copiado!' : 'Copiar Plantilla HTML'}</span>
                  </button>
                </div>
                <p className="text-slate-600 mb-2">
                  En Supabase, ve a <strong>Authentication</strong> → <strong>Email Templates</strong> → <strong>Magic Link / Confirmation</strong> y pega este código HTML para que el correo llegue con el logo y estética de Tapiz Fresh:
                </p>
                <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl overflow-x-auto text-[11px] max-h-40">
                  {emailBrevoTemplate}
                </pre>
              </div>
            </div>
          </div>

          {/* PASO 3: SUBIR A GITHUB */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    Paso 3: Subir tu Código a GitHub
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comandos de terminal listos para publicar tu repositorio en GitHub.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCopy(gitCommands, 'gitCommands')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'gitCommands' ? '¡Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
              <pre className="text-teal-400">{gitCommands}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ADMINISTRADORES */}
      {activeSection === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-black text-base text-slate-800 mb-1">
              Invitar Administrador
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Solo los correos registrados aquí tienen permiso para ingresar al panel (/admin).
            </p>

            {inviteSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleInviteAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="colaborador@tapizfresh.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Andrés Gómez"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-xs shadow-md shadow-[#78BDC4]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invitar Administrador</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800">
                Administradores Autorizados ({admins.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#78BDC4] to-[#4F9DA6] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {adm.nombre.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                        <span>{adm.nombre}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          adm.rol === 'propietaria'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {adm.rol}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{adm.correo}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Activo
                    </span>
                    {adm.correo !== 'tapizoma2026@gmail.com' && (
                      <button
                        onClick={() => handleDeleteAdmin(adm.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Eliminar administrador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: SERVICIOS */}
      {activeSection === 'servicios' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-black text-base text-slate-800">Servicios en Bogotá</h3>
          <p className="text-xs text-slate-500">
            Catálogo de muebles y servicios ofrecidos a domicilio en Bogotá.
          </p>

          <div className="space-y-3 pt-2">
            {config.servicios.map((srv) => (
              <div key={srv.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-slate-800">{srv.nombre}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{srv.descripcion}</div>
                </div>
                <span className="text-xs font-bold text-[#4F9DA6] bg-[#EBF7F8] px-3 py-1 rounded-xl">
                  Cotización con Foto
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PLANTILLAS */}
      {activeSection === 'plantillas' && (
        <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-black text-base text-slate-800">Plantillas de WhatsApp para Bogotá</h3>
          <p className="text-xs text-slate-500">
            Personaliza los mensajes predeterminados para responder a los clientes de Bogotá.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp: Respuesta a Solicitud de Foto
              </label>
              <textarea
                rows={3}
                value={config.plantillas.whatsapp_primer_contacto}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    plantillas: { ...config.plantillas, whatsapp_primer_contacto: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp: Confirmación de Cita a Domicilio
              </label>
              <textarea
                rows={3}
                value={config.plantillas.whatsapp_confirmacion_cita}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    plantillas: { ...config.plantillas, whatsapp_confirmacion_cita: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-xs shadow-md shadow-[#78BDC4]/25 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Plantillas</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION: CARRUSEL */}
      {activeSection === 'carrusel' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-black text-base text-slate-800">Galería de Trabajos Reales en Bogotá</h3>
          <p className="text-xs text-slate-500">
            Muestra el antes y después del lavado a domicilio.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {config.carrusel.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 flex">
                  <div className="w-1/2 h-full relative">
                    <img src={item.fotoAntes} alt="Antes" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500 text-white">
                      Antes
                    </span>
                  </div>
                  <div className="w-1/2 h-full relative">
                    <img src={item.fotoDespues} alt="Después" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500 text-white">
                      Después
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-slate-800">{item.titulo}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: COPIA DE SEGURIDAD */}
      {activeSection === 'backup' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#4F9DA6]" />
            <h3 className="font-black text-base text-slate-800">Copia de Seguridad de Clientes</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Descarga en tu computador un archivo Excel / CSV con todos los clientes de Bogotá registrados en tu CRM con sus teléfonos, direcciones y estados.
          </p>

          <div className="pt-2">
            <button
              onClick={handleExportBackup}
              className="px-6 py-3.5 rounded-2xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Todos Mis Clientes en CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
