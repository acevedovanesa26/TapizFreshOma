import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Briefcase,
  MessageSquare,
  Images,
  Download,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Upload,
  Camera,
  Link,
  ShieldCheck,
  Check,
  AlertCircle,
  Key,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Administrador, ConfiguracionApp, ItemCarrusel } from '../../types';
import { exportClientesToCsv } from '../../services/csvExport';
import { getBrevoApiKey, saveBrevoApiKey } from '../../services/emailService';
import { isSupabaseConfigured, saveSupabaseCredentials, supabaseUrl, supabaseAnonKey } from '../../services/supabase';

interface SettingsTabProps {
  currentAdmin: Administrador;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentAdmin }) => {
  const [config, setConfig] = useState<ConfiguracionApp>(storage.getConfig());
  const [admins, setAdmins] = useState<Administrador[]>(storage.getAdministradores());

  // Active section (Intuitive tabs)
  const [activeTab, setActiveTab] = useState<'fotos' | 'conexion' | 'admins' | 'plantillas' | 'backup'>('fotos');

  // Connection settings state
  const [brevoKeyInput, setBrevoKeyInput] = useState(getBrevoApiKey());
  const [sbUrlInput, setSbUrlInput] = useState(supabaseUrl);
  const [sbKeyInput, setSbKeyInput] = useState(supabaseAnonKey);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  // Invite Admin State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Save feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setConfig(storage.getConfig());
      setAdmins(storage.getAdministradores());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  const handleSaveConfig = (newConfig?: ConfiguracionApp) => {
    const cfg = newConfig || config;
    storage.saveConfig(cfg);
    setConfig(cfg);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle Image Upload for Hero or Catalog
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoad: (dataUrl: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onLoad(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConnectionSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrevoApiKey(brevoKeyInput);
    saveSupabaseCredentials(sbUrlInput, sbKeyInput);
    setConnectionNotice('¡Credenciales guardadas y conectadas con éxito!');
    setTimeout(() => setConnectionNotice(null), 4000);
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    storage.inviteAdmin(inviteEmail, inviteName, 'admin');
    setInviteEmail('');
    setInviteName('');
    setInviteSuccessMsg(`¡${inviteEmail} fue autorizado! Recibirá el código en su correo al ingresar.`);
    setTimeout(() => setInviteSuccessMsg(''), 4000);
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('¿Seguro que deseas revocar el acceso a este administrador?')) {
      storage.deleteAdmin(id);
    }
  };

  const handleUpdateCarouselItem = (
    index: number,
    field: 'fotoAntes' | 'fotoDespues' | 'titulo' | 'descripcion',
    value: string
  ) => {
    const updated = [...config.carrusel];
    updated[index] = { ...updated[index], [field]: value };
    const newCfg = { ...config, carrusel: updated };
    handleSaveConfig(newCfg);
  };

  const handleAddCarouselItem = () => {
    const newItem: ItemCarrusel = {
      id: `carr-${Date.now()}`,
      titulo: 'Nuevo Trabajo de Lavado',
      descripcion: 'Lavado y desmanchado profundo a domicilio en Bogotá.',
      categoria: 'Muebles',
      fotoAntes: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      fotoDespues: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    };
    const newCfg = { ...config, carrusel: [...config.carrusel, newItem] };
    handleSaveConfig(newCfg);
  };

  const handleDeleteCarouselItem = (index: number) => {
    if (window.confirm('¿Eliminar esta comparación de fotos del carrusel?')) {
      const updated = config.carrusel.filter((_, i) => i !== index);
      handleSaveConfig({ ...config, carrusel: updated });
    }
  };

  const handleUpdateFurniturePhoto = (furnitureId: string, dataUrl: string) => {
    const currentMap = config.fotosMuebles || {};
    const newCfg = {
      ...config,
      fotosMuebles: {
        ...currentMap,
        [furnitureId]: dataUrl,
      },
    };
    handleSaveConfig(newCfg);
  };

  const isBrevoConnected = Boolean(getBrevoApiKey());
  const isSbConnected = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4F9DA6]" />
            <span>Configuración de Tapiz Fresh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cambia las fotos de la web, administra accesos y configura el envío de correos.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Fotos y cambios guardados!</span>
          </div>
        )}
      </div>

      {/* Clean, intuitive Tab Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('fotos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'fotos'
              ? 'bg-[#78BDC4] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Cambiar Fotos de la Página</span>
        </button>

        <button
          onClick={() => setActiveTab('conexion')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'conexion'
              ? 'bg-[#78BDC4] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Conexión de Correos y Base de Datos</span>
          {(isBrevoConnected || isSbConnected) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'admins'
              ? 'bg-[#78BDC4] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Administradores</span>
        </button>

        <button
          onClick={() => setActiveTab('plantillas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'plantillas'
              ? 'bg-[#78BDC4] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensajes de WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-[#78BDC4] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Descargar Clientes (CSV)</span>
        </button>
      </div>

      {/* TAB 1: CAMBIAR TODAS LAS FOTOS DE LA PÁGINA */}
      {activeTab === 'fotos' && (
        <div className="space-y-6">
          {/* 1.1 FOTO PRINCIPAL HERO */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#4F9DA6]" />
                <span>Foto Principal del Inicio (Pantalla de Bienvenida)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Esta es la foto grande que ven los clientes al entrar a la página.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative group">
                  <img
                    src={
                      config.fotoHeroPrincipal ||
                      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
                    }
                    alt="Foto Inicio Actual"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                    Foto Actual en Vivo
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subir nueva foto desde tu celular o computador:
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-[#78BDC4] bg-[#EBF7F8]/40 hover:bg-[#EBF7F8] text-xs font-bold text-[#2F6F77] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#4F9DA6]" />
                    <span>Seleccionar foto de tu galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) =>
                          handleSaveConfig({ ...config, fotoHeroPrincipal: dataUrl })
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    O escribe un enlace / URL de la imagen:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={config.fotoHeroPrincipal || ''}
                      onChange={(e) =>
                        setConfig({ ...config, fotoHeroPrincipal: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveConfig()}
                      className="px-4 py-2 bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 FOTOS DE LOS MUEBLES (COTIZADOR) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Images className="w-5 h-5 text-[#4F9DA6]" />
                <span>Fotos de los Muebles en el Formulario de Cotización</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personaliza la foto de cada opción que el cliente puede seleccionar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { id: 'sofa-l', label: 'Sofá en L / Seccional', defaultImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' },
                { id: 'sofa-3', label: 'Sofá 3 Puestos', defaultImg: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80' },
                { id: 'sofa-2', label: 'Sofá 2 Puestos', defaultImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
                { id: 'colchon-king', label: 'Colchón Queen / King', defaultImg: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=400&q=80' },
                { id: 'colchon-doble', label: 'Colchón Doble / Sencillo', defaultImg: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80' },
                { id: 'sillas-comedor', label: 'Sillas de Comedor', defaultImg: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=400&q=80' },
              ].map((item) => {
                const currentImg =
                  (config.fotosMuebles && config.fotosMuebles[item.id]) || item.defaultImg;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={currentImg}
                        alt={item.label}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-xs text-slate-800 block truncate">
                          {item.label}
                        </span>
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#78BDC4] text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs mt-1 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-[#4F9DA6]" />
                          <span>Cambiar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, (dataUrl) =>
                                handleUpdateFurniturePhoto(item.id, dataUrl)
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1.3 CARRUSEL ANTES Y DESPUÉS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                  <Images className="w-5 h-5 text-[#4F9DA6]" />
                  <span>Fotos del Carrusel "Antes y Después"</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cambia o sube los trabajos reales de lavado para convencer a los clientes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCarouselItem}
                className="px-3 py-1.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Trabajo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {config.carrusel.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.titulo}
                      onChange={(e) => handleUpdateCarouselItem(idx, 'titulo', e.target.value)}
                      className="font-bold text-xs text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-[#78BDC4] w-3/4 pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCarouselItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Eliminar este trabajo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Foto Antes */}
                    <div className="space-y-1">
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 relative">
                        <img src={item.fotoAntes} alt="Antes" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500 text-white">
                          ANTES
                        </span>
                      </div>
                      <label className="w-full text-center block py-1 bg-white border border-slate-200 hover:border-[#78BDC4] rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer">
                        Subir Foto Antes
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, (dataUrl) =>
                              handleUpdateCarouselItem(idx, 'fotoAntes', dataUrl)
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Foto Después */}
                    <div className="space-y-1">
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 relative">
                        <img src={item.fotoDespues} alt="Después" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-white">
                          DESPUÉS
                        </span>
                      </div>
                      <label className="w-full text-center block py-1 bg-white border border-slate-200 hover:border-[#78BDC4] rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer">
                        Subir Foto Después
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, (dataUrl) =>
                              handleUpdateCarouselItem(idx, 'fotoDespues', dataUrl)
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONEXIÓN INTUITIVA (BREVO Y SUPABASE) */}
      {activeTab === 'conexion' && (
        <form onSubmit={handleSaveConnectionSettings} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#4F9DA6]" />
              <span>Conexión de Correos y Base de Datos</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura tus claves para que los correos lleguen al instante y toda la información se sincronice en cualquier dispositivo.
            </p>
          </div>

          {connectionNotice && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{connectionNotice}</span>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Brevo API Key */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Clave API de Brevo (Para enviar correos)</span>
                </label>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isBrevoConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isBrevoConnected ? '🟢 Brevo Conectado' : '⚪ Sin clave'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tu clave API de Brevo (Sendinblue). Con esta clave, los códigos de acceso y las notificaciones llegarán de forma automática a tu correo.
              </p>
              <input
                type="password"
                placeholder="xkeysib-..."
                value={brevoKeyInput}
                onChange={(e) => setBrevoKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
              />
            </div>

            {/* Supabase URL and Key */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Base de Datos Supabase (Sincronización en Tiempo Real)
                </label>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSbConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSbConnected ? '🟢 Supabase Activo' : '⚪ Modo Local'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Permite que los clientes creados desde el celular o cualquier red se guarden al instante en tu base de datos en la nube.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Project URL de Supabase:
                  </span>
                  <input
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={sbUrlInput}
                    onChange={(e) => setSbUrlInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Anon Public Key:
                  </span>
                  <input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={sbKeyInput}
                    onChange={(e) => setSbKeyInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-xs shadow-md shadow-[#78BDC4]/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Conexión</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ADMINISTRADORES */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-black text-base text-slate-800 mb-1">
              Autorizar a un Colaborador
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
                  <span>Autorizar</span>
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

      {/* TAB 4: PLANTILLAS WHATSAPP */}
      {activeTab === 'plantillas' && (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig(); }} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-black text-base text-slate-800">Plantillas de Respuesta para WhatsApp</h3>
          <p className="text-xs text-slate-500">
            Mensajes predeterminados que se abren en WhatsApp con un solo clic para responder a clientes en Bogotá.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp: Responder Cotización con Foto
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
              <span>Guardar Mensajes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: COPIA DE SEGURIDAD */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#4F9DA6]" />
            <h3 className="font-black text-base text-slate-800">Descargar Copia de Seguridad</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Descarga en formato Excel / CSV todos los clientes de Bogotá guardados con sus nombres, teléfonos, barrios y estado de servicio.
          </p>

          <div className="pt-2">
            <button
              onClick={() => exportClientesToCsv(storage.getClientes())}
              className="px-6 py-3.5 rounded-2xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
