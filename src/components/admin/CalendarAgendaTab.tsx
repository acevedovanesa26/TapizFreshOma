import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  MessageSquare,
  Mail,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Cita, Cliente, EstadoCita } from '../../types';
import { downloadIcsFile } from '../../services/calendarExport';
import { openWhatsAppChat } from '../../services/whatsapp';

type CalendarViewMode = 'mes' | 'semana' | 'dia';

export const CalendarAgendaTab: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mes');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Appointment Modal (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);

  // Form Fields
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [servicio, setServicio] = useState('Lavado Profundo Tapiz Fresh');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [ciudad, setCiudad] = useState('Bogotá');
  const [fechaInicioDate, setFechaInicioDate] = useState('');
  const [fechaInicioTime, setFechaInicioTime] = useState('09:00');
  const [duracionHoras, setDuracionHoras] = useState(2);
  const [valor, setValor] = useState(160000);
  const [estado, setEstado] = useState<EstadoCita>('confirmada');
  const [notas, setNotas] = useState('');

  // Conflict Warning
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Reminder feedback
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setCitas(storage.getCitas());
      setClientes(storage.getClientes());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  const openNewCitaModal = () => {
    setEditingCita(null);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setFechaInicioDate(tmr.toISOString().substring(0, 10));
    setFechaInicioTime('10:00');
    setDuracionHoras(2);
    setTitulo('Lavado Sofá 3 Puestos');
    setServicio('Lavado Profundo Tapiz Fresh');
    setValor(160000);
    setEstado('confirmada');
    setNotas('Llevar máquina Kärcher y bactericida.');
    setConflictWarning(null);

    if (clientes.length > 0) {
      const c = clientes[0];
      setSelectedClienteId(c.id);
      setDireccion(c.direccion);
      setBarrio(c.barrio);
      setCiudad(c.ciudad);
    }
    setIsModalOpen(true);
  };

  const openEditCitaModal = (c: Cita) => {
    setEditingCita(c);
    setSelectedClienteId(c.cliente_id);
    setTitulo(c.titulo);
    setServicio(c.servicio);
    setDireccion(c.direccion);
    setBarrio(c.barrio);
    setCiudad(c.ciudad);
    setFechaInicioDate(c.fecha_inicio.substring(0, 10));
    setFechaInicioTime(c.fecha_inicio.substring(11, 16));

    const start = new Date(c.fecha_inicio).getTime();
    const end = new Date(c.fecha_fin).getTime();
    const diffHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
    setDuracionHoras(diffHours);

    setValor(c.valor);
    setEstado(c.estado);
    setNotas(c.notas);
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleClienteSelectChange = (cliId: string) => {
    setSelectedClienteId(cliId);
    const c = storage.getClienteById(cliId);
    if (c) {
      setDireccion(c.direccion);
      setBarrio(c.barrio);
      setCiudad(c.ciudad);
    }
  };

  const checkConflictOnTimeChange = (date: string, time: string, duration: number) => {
    if (!date || !time) return;
    const startIso = `${date}T${time}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    const conflict = storage.checkScheduleConflict(
      startIso,
      endDate.toISOString(),
      editingCita?.id
    );

    if (conflict.hasConflict && conflict.conflictingCita) {
      setConflictWarning(
        `⚠️ Choque detectado con "${conflict.conflictingCita.titulo}" (${conflict.conflictingCita.fecha_inicio.substring(
          11,
          16
        )} - ${conflict.conflictingCita.fecha_fin.substring(11, 16)}). Ajusta el horario para evitar retrasos.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleSaveCita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId || !fechaInicioDate || !fechaInicioTime) return;

    const startIso = `${fechaInicioDate}T${fechaInicioTime}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + duracionHoras * 60 * 60 * 1000);

    const citaToSave: Cita = {
      id: editingCita ? editingCita.id : `cit-${Date.now()}`,
      cliente_id: selectedClienteId,
      titulo,
      servicio,
      direccion,
      barrio,
      ciudad,
      fecha_inicio: startIso,
      fecha_fin: endDate.toISOString(),
      estado,
      valor: Number(valor),
      notas,
      recordatorio_enviado: editingCita ? editingCita.recordatorio_enviado : false,
      creado_en: editingCita ? editingCita.creado_en : new Date().toISOString(),
    };

    storage.saveCita(citaToSave);
    setIsModalOpen(false);
  };

  const handleDeleteCita = (id: string) => {
    if (window.confirm('¿Seguro que deseas cancelar y eliminar esta cita de la agenda?')) {
      storage.deleteCita(id);
      setIsModalOpen(false);
    }
  };

  // WhatsApp Confirmation
  const handleConfirmWhatsApp = (c: Cita) => {
    const cli = storage.getClienteById(c.cliente_id);
    const dateFormatted = new Date(c.fecha_inicio).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeFormatted = c.fecha_inicio.substring(11, 16);

    const msg = `¡Hola ${cli?.nombre || 'Cliente'}! ✨ Tu cita con Tapiz Fresh ha sido CONFIRMADA:\n\n📅 Fecha: ${dateFormatted}\n⏰ Hora estimada: ${timeFormatted}\n📍 Lugar: ${c.direccion}, ${c.barrio}\n🛋️ Servicio: ${c.titulo}\n💰 Valor acordado: $${c.valor.toLocaleString('es-CO')} COP\n\nRecomendación previa: por favor despejar el área cercana al mueble para instalar el equipo de inyección-extracción. ¡Nos vemos pronto!`;

    openWhatsAppChat(cli ? cli.telefono : '', msg);
  };

  // 24h Brevo Reminder Simulation
  const handleSendReminderBrevo = (c: Cita) => {
    const cli = storage.getClienteById(c.cliente_id);
    c.recordatorio_enviado = true;
    storage.saveCita(c);

    // Add follow-up
    storage.addSeguimiento({
      cliente_id: c.cliente_id,
      tipo: 'correo',
      nota: `Recordatorio 24h enviado automáticamente vía Brevo SMTP para visita del ${c.fecha_inicio.substring(0, 10)}`,
      creado_por: 'Brevo Automations',
    });

    setReminderToast(`✅ Recordatorio 24h enviado exitosamente vía Brevo SMTP a ${cli?.correo || 'cliente'}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Google Calendar ICS Download
  const handleExportIcs = (c: Cita) => {
    const cli = storage.getClienteById(c.cliente_id);
    downloadIcsFile(c, cli?.nombre || 'Cliente Tapiz Fresh', cli?.telefono);
  };

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'semana') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'semana') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const statusBadge: Record<EstadoCita, { label: string; bg: string; text: string }> = {
    pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-800' },
    confirmada: { label: 'Confirmada', bg: 'bg-[#EBF7F8]', text: 'text-[#2F6F77]' },
    en_camino: { label: 'En camino', bg: 'bg-purple-100', text: 'text-purple-800' },
    realizada: { label: 'Realizada', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    cancelada: { label: 'Cancelada', bg: 'bg-slate-200', text: 'text-slate-700' },
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {reminderToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-4">
          {reminderToast}
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#4F9DA6]" />
            <span>Agenda de Visitas a Domicilio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Programación de citas, detección de choques de horario y sincronización con Google Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            {(['mes', 'semana', 'dia'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-white text-slate-800 shadow-xs font-black' : 'hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={openNewCitaModal}
            className="px-4 py-2.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#78BDC4]/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Hoy
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-800 capitalize">
          {currentDate.toLocaleDateString('es-CO', {
            month: 'long',
            year: 'numeric',
            ...(viewMode === 'dia' ? { day: 'numeric', weekday: 'long' } : {}),
          })}
        </h3>

        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          {citas.filter((c) => c.estado !== 'cancelada').length} visitas activas
        </div>
      </div>

      {/* Agenda Appointments List & Cards */}
      <div className="space-y-4">
        {citas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No hay citas registradas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Programa una nueva visita usando el botón "Nueva Cita".
            </p>
          </div>
        ) : (
          citas.map((cita) => {
            const cli = storage.getClienteById(cita.cliente_id);
            const badge = statusBadge[cita.estado] || statusBadge.confirmada;
            const dateStr = new Date(cita.fecha_inicio).toLocaleDateString('es-CO', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            const timeStr = `${cita.fecha_inicio.substring(11, 16)} - ${cita.fecha_fin.substring(11, 16)}`;

            return (
              <div
                key={cita.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Time & Client Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Date badge */}
                  <div className="w-16 h-16 rounded-2xl bg-[#EBF7F8] border border-[#78BDC4]/40 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-[11px] font-bold text-[#4F9DA6] uppercase">
                      {new Date(cita.fecha_inicio).toLocaleDateString('es-CO', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black text-[#2F6F77] leading-none">
                      {new Date(cita.fecha_inicio).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-slate-800 text-base">{cita.titulo}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {cita.recordatorio_enviado && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ Recordatorio 24h enviado
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 font-semibold">
                      Cliente: <strong className="text-slate-800">{cli?.nombre || 'Cliente'}</strong> • Tel: {cli?.telefono}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#4F9DA6]" />
                        <span>{timeStr}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4F9DA6]" />
                        <span>
                          {cita.direccion}, {cita.barrio} ({cita.ciudad})
                        </span>
                      </span>
                    </div>

                    {cita.notas && (
                      <p className="text-[11px] text-slate-500 italic mt-1">"{cita.notas}"</p>
                    )}
                  </div>
                </div>

                {/* Value & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Valor Servicio
                    </span>
                    <span className="text-xl font-black text-[#2F6F77]">
                      ${cita.valor.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Confirm WhatsApp */}
                    <button
                      onClick={() => handleConfirmWhatsApp(cita)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Confirmar por WhatsApp con plantilla de visita"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Confirmar WhatsApp</span>
                    </button>

                    {/* 24h Brevo Reminder */}
                    <button
                      onClick={() => handleSendReminderBrevo(cita)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Enviar correo de recordatorio 24 horas antes por Brevo SMTP"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Recordatorio 24h</span>
                    </button>

                    {/* Google Calendar ICS export */}
                    <button
                      onClick={() => handleExportIcs(cita)}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      title="Descargar archivo .ics para Google Calendar"
                    >
                      <Download className="w-4 h-4 text-[#4F9DA6]" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditCitaModal(cita)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW / EDIT APPOINTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-800">
                {editingCita ? 'Editar Cita de Agenda' : 'Programar Nueva Visita'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict warning banner */}
            {conflictWarning && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveCita} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cliente Registrado *
                </label>
                <select
                  required
                  value={selectedClienteId}
                  onChange={(e) => handleClienteSelectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#78BDC4]"
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.barrio} - {c.telefono})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Servicio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lavado Sofá en L + 2 Colchones"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección *</label>
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Barrio *</label>
                  <input
                    type="text"
                    required
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Visita *</label>
                  <input
                    type="date"
                    required
                    value={fechaInicioDate}
                    onChange={(e) => {
                      setFechaInicioDate(e.target.value);
                      checkConflictOnTimeChange(e.target.value, fechaInicioTime, duracionHoras);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={fechaInicioTime}
                    onChange={(e) => {
                      setFechaInicioTime(e.target.value);
                      checkConflictOnTimeChange(fechaInicioDate, e.target.value, duracionHoras);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duración Est.</label>
                  <select
                    value={duracionHoras}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDuracionHoras(d);
                      checkConflictOnTimeChange(fechaInicioDate, fechaInicioTime, d);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#78BDC4]"
                  >
                    <option value={1}>1 hora</option>
                    <option value={1.5}>1.5 horas</option>
                    <option value={2}>2 horas</option>
                    <option value={2.5}>2.5 horas</option>
                    <option value={3}>3 horas</option>
                    <option value={4}>4 horas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Cobro ($ COP)</label>
                  <input
                    type="number"
                    required
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Cita</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoCita)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white capitalize focus:border-[#78BDC4]"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_camino">En camino</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas / Observaciones del Servicio
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingCita ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCita(editingCita.id)}
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold cursor-pointer"
                  >
                    Eliminar Cita
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-xs shadow-md shadow-[#78BDC4]/25 cursor-pointer"
                  >
                    Guardar Cita
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
