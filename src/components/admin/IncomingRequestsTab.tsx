import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Sparkles,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  Eye,
  X,
  MapPin,
  Clock,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Cotizacion, Cliente, Cita } from '../../types';
import { openWhatsAppChat } from '../../services/whatsapp';

export const IncomingRequestsTab: React.FC = () => {
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Modal to convert quote into an appointment
  const [convertingQuote, setConvertingQuote] = useState<Cotizacion | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setQuotes(storage.getCotizaciones());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  const handleMarkAsAttended = (quoteId: string) => {
    storage.markQuoteAsRead(quoteId);
    const q = quotes.find((it) => it.id === quoteId);
    if (q) {
      q.estado = 'aprobada';
      storage.saveCotizacion(q);
    }
  };

  const handleWhatsAppReply = (quote: Cotizacion) => {
    storage.markQuoteAsRead(quote.id);
    const cliente = storage.getClienteById(quote.cliente_id);
    const clientName = quote.cliente_nombre || (cliente ? cliente.nombre : 'Cliente');
    const phone = quote.cliente_telefono || (cliente ? cliente.telefono : '');
    const itemsSummary = quote.items.map((it) => it.mueble).join(', ');

    const msg = quote.valor_cotizado > 0
      ? `¡Hola ${clientName}! 👋 Te saluda Omaira de Tapiz Fresh en Bogotá. Revisé la foto de tu ${itemsSummary} en ${quote.cliente_barrio || 'Bogotá'}. El valor del lavado a domicilio es de $${quote.valor_cotizado.toLocaleString('es-CO')} COP. ¿Te gustaría agendar la visita para esta semana?`
      : `¡Hola ${clientName}! 👋 Te saluda Omaira de Tapiz Fresh en Bogotá. Recibí tu solicitud para el lavado de tu ${itemsSummary} en ${quote.cliente_barrio || 'Bogotá'}. Con gusto te doy la cotización exacta; ¿me podrías enviar la foto del mueble por este medio?`;

    openWhatsAppChat(phone, msg);
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const openConvertModal = (quote: Cotizacion) => {
    setConvertingQuote(quote);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setAppointmentDate(tmr.toISOString().substring(0, 10));
    setAppointmentTime('10:00');
    setAppointmentNotes(quote.notas_internas || 'Servicio acordado desde cotización web.');
    setConflictWarning(null);
  };

  const handleCheckConflict = (date: string, time: string) => {
    if (!date || !time) return;
    const startIso = `${date}T${time}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
    const endIso = endDate.toISOString();

    const conflict = storage.checkScheduleConflict(startIso, endIso);
    if (conflict.hasConflict && conflict.conflictingCita) {
      setConflictWarning(
        `⚠️ Choque de horario con: "${conflict.conflictingCita.titulo}" (${conflict.conflictingCita.fecha_inicio.substring(11, 16)}). Te sugerimos elegir otra hora.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingQuote || !appointmentDate || !appointmentTime) return;

    const cliente = storage.getClienteById(convertingQuote.cliente_id);
    const startIso = `${appointmentDate}T${appointmentTime}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const newCita: Cita = {
      id: `cit-${Date.now()}`,
      cliente_id: convertingQuote.cliente_id,
      titulo: `Lavado: ${convertingQuote.items.map((i) => i.mueble).join(', ')}`,
      servicio: 'Lavado Profundo Tapiz Fresh',
      direccion: cliente ? cliente.direccion : 'Dirección pendiente',
      barrio: convertingQuote.cliente_barrio || (cliente ? cliente.barrio : 'Bogotá'),
      ciudad: convertingQuote.cliente_ciudad || (cliente ? cliente.ciudad : 'Bogotá'),
      fecha_inicio: startIso,
      fecha_fin: endDate.toISOString(),
      estado: 'confirmada',
      valor: convertingQuote.valor_cotizado,
      notas: appointmentNotes,
      recordatorio_enviado: false,
      creado_en: new Date().toISOString(),
    };

    storage.saveCita(newCita);

    // Update quote and client status
    convertingQuote.estado = 'agendada';
    convertingQuote.es_nuevo = false;
    storage.saveCotizacion(convertingQuote);

    if (cliente) {
      cliente.estado = 'agendado';
      storage.saveCliente(cliente);
    }

    // Add follow-up record
    storage.addSeguimiento({
      cliente_id: convertingQuote.cliente_id,
      tipo: 'WhatsApp',
      nota: `Cotización convertida en cita para el ${appointmentDate} a las ${appointmentTime}`,
      creado_por: 'Omaira Motato',
    });

    setConvertingQuote(null);
    alert('¡Cita programada con éxito en la Agenda!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">Solicitudes Entrantes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF7F8] text-[#2F6F77] border border-[#78BDC4]/40">
              Tiempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contactos y cotizaciones enviadas desde los formularios de la página web.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-100">
          Notificaciones configuradas a: <strong className="text-slate-800">tapizoma2026@gmail.com</strong>
        </div>
      </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-3 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Mueble o mancha ampliada"
              className="w-full h-auto max-h-[80vh] rounded-2xl object-contain bg-slate-100"
            />
          </div>
        </div>
      )}

      {/* Convert into Appointment Modal */}
      {convertingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#4F9DA6]" />
                <h3 className="font-extrabold text-base text-slate-800">
                  Convertir en Cita de Agenda
                </h3>
              </div>
              <button
                onClick={() => setConvertingQuote(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#EBF7F8] border border-[#78BDC4]/30 text-xs">
                <div className="font-bold text-slate-800">
                  Cliente: {convertingQuote.cliente_nombre}
                </div>
                <div className="text-slate-600 mt-0.5">
                  Ubicación: {convertingQuote.cliente_barrio}, {convertingQuote.cliente_ciudad}
                </div>
                <div className="text-emerald-700 font-extrabold mt-1">
                  Valor Cotizado: ${convertingQuote.valor_cotizado.toLocaleString('es-CO')} COP
                </div>
              </div>

              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de la Visita *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value);
                      handleCheckConflict(e.target.value, appointmentTime);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Estimada *
                  </label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => {
                      setAppointmentTime(e.target.value);
                      handleCheckConflict(appointmentDate, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Visita o Instrucciones de Llegada
                </label>
                <textarea
                  rows={2}
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConvertingQuote(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-xs shadow-md shadow-[#78BDC4]/25 cursor-pointer"
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {quotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No hay solicitudes entrantes</h3>
            <p className="text-xs text-slate-400 mt-1">
              Las nuevas cotizaciones del sitio público aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          quotes.map((quote) => {
            const cliente = storage.getClienteById(quote.cliente_id);
            return (
              <div
                key={quote.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs relative ${
                  quote.es_nuevo
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-emerald-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Visual New Badge */}
                {quote.es_nuevo && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>NUEVO</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Client Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-800">
                        {quote.cliente_nombre || (cliente ? cliente.nombre : 'Cliente')}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {quote.cliente_barrio || (cliente ? cliente.barrio : 'Bogotá')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(quote.creado_en).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        📞 <strong>{quote.cliente_telefono || (cliente ? cliente.telefono : '')}</strong>
                      </span>
                      <span>
                        📍 {cliente?.direccion || 'Dirección completa en ficha'}
                      </span>
                      <span>
                        Canal: <strong>{cliente?.origen || 'Web'}</strong>
                      </span>
                    </div>

                    {/* Quoted Furniture Items */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {quote.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {item.cantidad}x {item.mueble} (${item.subtotal.toLocaleString('es-CO')})
                        </span>
                      ))}
                    </div>

                    {quote.notas_internas && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-2">
                        "{quote.notas_internas}"
                      </p>
                    )}
                  </div>

                  {/* Photo Thumbnail Gallery */}
                  {quote.fotos && quote.fotos.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      {quote.fotos.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedPhoto(img)}
                          className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 relative group cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#78BDC4]"
                        >
                          <img src={img} alt="Foto cliente" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Value and Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {quote.valor_cotizado > 0 ? 'Valor Cotizado' : 'Cotización con Foto'}
                      </span>
                      {quote.valor_cotizado > 0 ? (
                        <span className="text-2xl font-black text-[#2F6F77]">
                          ${quote.valor_cotizado.toLocaleString('es-CO')}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold mt-1">
                          📸 Foto Recibida (Por cotizar)
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleWhatsAppReply(quote)}
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title="Responder mensaje prellenado por WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() =>
                          handleCall(quote.cliente_telefono || (cliente ? cliente.telefono : ''))
                        }
                        className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Llamar al cliente"
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openConvertModal(quote)}
                        className="px-3 py-2 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Agendar en el calendario"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Convertir en Cita</span>
                      </button>

                      {quote.es_nuevo && (
                        <button
                          onClick={() => handleMarkAsAttended(quote.id)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Marcar como atendida"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
