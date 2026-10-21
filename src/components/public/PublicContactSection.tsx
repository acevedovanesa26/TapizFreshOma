import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, Camera } from 'lucide-react';
import { storage } from '../../services/storage';
import { OrigenCliente } from '../../types';
import { openWhatsAppChat, TAPIZ_FRESH_PHONE, TAPIZ_FRESH_PHONE_FORMATTED } from '../../services/whatsapp';

export const PublicContactSection: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [origen, setOrigen] = useState<OrigenCliente>('WhatsApp');
  const [mensaje, setMensaje] = useState('');

  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !barrio.trim()) {
      alert('Por favor completa tu nombre, teléfono, dirección y barrio en Bogotá.');
      return;
    }

    setCargando(true);

    setTimeout(() => {
      // Sync or deduplicate in CRM (strictly Bogotá)
      const cliente = storage.saveOrUpdateClienteFromForm({
        nombre,
        telefono,
        correo: correo || `${telefono.replace(/\D/g, '')}@cliente.tapizfresh.com`,
        direccion,
        barrio,
        ciudad: 'Bogotá',
        origen,
        notas: `Consulta web directa: ${mensaje}`,
      });

      storage.addNotification({
        titulo: '¡Nuevo mensaje de contacto en Bogotá!',
        mensaje: `${cliente.nombre} (${cliente.barrio}) solicitó información de lavado de muebles.`,
        tipo: 'solicitud',
        cliente_id: cliente.id,
      });

      storage.addTask({
        titulo: `Contactar a ${cliente.nombre}`,
        detalle: `Barrio: ${cliente.barrio} (Bogotá) - Tel: ${cliente.telefono}`,
        tipo: 'seguimiento',
        cliente_id: cliente.id,
        cliente_nombre: cliente.nombre,
      });

      setCargando(false);
      setEnviado(true);
    }, 400);
  };

  const handleSendViaWhatsApp = () => {
    const text = `¡Hola Omaira! Mi nombre es *${nombre}*. Vivo en Bogotá en el barrio *${barrio}* (Dirección: ${direccion}).\n\nTe escribo para cotizar el lavado de mis muebles: ${mensaje}.\n\nYa te adjunto la foto para que me des el valor. ¡Gracias!`;
    openWhatsAppChat(TAPIZ_FRESH_PHONE, text);
  };

  return (
    <section id="contacto" className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-[#4F9DA6] uppercase tracking-wider bg-[#EBF7F8] px-3.5 py-1 rounded-full border border-[#78BDC4]/40">
              Atención Directa en Bogotá
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              ¿Quieres Hablar Directamente con Omaira?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Escríbenos por WhatsApp o déjanos tus datos. Te responderemos rápidamente con la información del lavado para tu hogar en Bogotá.
            </p>

            <div className="space-y-3.5 pt-2">
              <a
                href={`tel:${TAPIZ_FRESH_PHONE}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#4F9DA6]" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Llámanos o escríbenos</div>
                  <div className="text-base font-extrabold text-slate-800">{TAPIZ_FRESH_PHONE_FORMATTED}</div>
                </div>
              </a>

              <a
                href={`https://wa.me/57${TAPIZ_FRESH_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs hover:bg-emerald-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">WhatsApp Oficial</div>
                  <div className="text-sm font-bold text-slate-800">Enviar foto y mensaje directo</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#4F9DA6]" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Zona de cobertura</div>
                  <div className="text-sm font-bold text-slate-800">Bogotá D.C. (Todos los barrios)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
              {enviado ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">
                    ¡Mensaje Recibido, {nombre}!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Tus datos para <strong>{barrio} (Bogotá)</strong> fueron recibidos. Te responderemos a tu teléfono <strong>{telefono}</strong>.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleSendViaWhatsApp}
                      className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir WhatsApp y Enviar Foto</span>
                    </button>
                    <button
                      onClick={() => {
                        setEnviado(false);
                        setMensaje('');
                      }}
                      className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-black text-slate-800">Contáctanos en Bogotá</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y apellido"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 321 991 8147"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dirección en Bogotá *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carrera 15 # 85-30"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Barrio en Bogotá *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Salitre, Chapinero..."
                        value={barrio}
                        onChange={(e) => setBarrio(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        disabled
                        value="Bogotá"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">¿Cómo nos conociste?</label>
                    <select
                      value={origen}
                      onChange={(e) => setOrigen(e.target.value as OrigenCliente)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Recomendación">Recomendación</option>
                      <option value="Google">Google</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje o muebles a lavar</label>
                    <textarea
                      rows={3}
                      placeholder="Escribe qué muebles tienes y si deseas enviar la foto por WhatsApp..."
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{cargando ? 'Enviando...' : 'Enviar Consulta'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
