import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MapPin,
  ExternalLink,
  Phone,
  MessageSquare,
  Mail,
  Tag,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Shield,
  FileText,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Cliente, Cotizacion, Cita, Seguimiento, EstadoCliente, OrigenCliente } from '../../types';
import { exportClientesToCsv, exportClienteDataJson } from '../../services/csvExport';
import { openWhatsAppChat } from '../../services/whatsapp';

export const ClientsCRMTab: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [barrioFilter, setBarrioFilter] = useState<string>('todos');
  const [origenFilter, setOrigenFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'nombre'>('recientes');

  // Selected client for detail drawer
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Modals
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);

  // New follow-up note inside drawer
  const [newFollowupType, setNewFollowupType] = useState<Seguimiento['tipo']>('WhatsApp');
  const [newFollowupNote, setNewFollowupNote] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    const refresh = () => {
      setClientes(storage.getClientes());
      if (selectedCliente) {
        const fresh = storage.getClienteById(selectedCliente.id);
        if (fresh) setSelectedCliente(fresh);
      }
    };
    refresh();
    return storage.subscribe(refresh);
  }, [selectedCliente?.id]);

  // Extract unique barrios for filter
  const uniqueBarrios = Array.from(
    new Set(clientes.map((c) => c.barrio).filter(Boolean))
  ).sort();

  // Filter & Search logic
  const filteredClientes = clientes
    .filter((c) => {
      const matchSearch =
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono.includes(searchTerm) ||
        c.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.barrio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.etiquetas.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || c.estado === statusFilter;
      const matchBarrio = barrioFilter === 'todos' || c.barrio === barrioFilter;
      const matchOrigen = origenFilter === 'todos' || c.origen === origenFilter;

      return matchSearch && matchStatus && matchBarrio && matchOrigen;
    })
    .sort((a, b) => {
      if (sortBy === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      }
      return new Date(b.actualizado_en).getTime() - new Date(a.actualizado_en).getTime();
    });

  // Client History Data for Drawer
  const clientQuotes = selectedCliente
    ? storage.getCotizaciones().filter((q) => q.cliente_id === selectedCliente.id)
    : [];

  const clientCitas = selectedCliente
    ? storage.getCitas().filter((c) => c.cliente_id === selectedCliente.id)
    : [];

  const clientFollowups = selectedCliente
    ? storage.getSeguimientosByCliente(selectedCliente.id)
    : [];

  const handleExportAll = () => {
    exportClientesToCsv(clientes);
  };

  const handleOpenGoogleMaps = (c: Cliente) => {
    const query = encodeURIComponent(`${c.direccion}, ${c.barrio}, ${c.ciudad}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente || !newFollowupNote.trim()) return;

    storage.addSeguimiento({
      cliente_id: selectedCliente.id,
      tipo: newFollowupType,
      nota: newFollowupNote.trim(),
      creado_por: 'Omaira Motato',
    });

    setNewFollowupNote('');
  };

  const handleAddTag = () => {
    if (!selectedCliente || !newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!selectedCliente.etiquetas.includes(tag)) {
      const updated: Cliente = {
        ...selectedCliente,
        etiquetas: [...selectedCliente.etiquetas, tag],
      };
      storage.saveCliente(updated);
      setSelectedCliente(updated);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedCliente) return;
    const updated: Cliente = {
      ...selectedCliente,
      etiquetas: selectedCliente.etiquetas.filter((t) => t !== tagToRemove),
    };
    storage.saveCliente(updated);
    setSelectedCliente(updated);
  };

  const handleChangeStatus = (newEstado: EstadoCliente) => {
    if (!selectedCliente) return;
    const updated: Cliente = {
      ...selectedCliente,
      estado: newEstado,
    };
    storage.saveCliente(updated);
    setSelectedCliente(updated);
  };

  const handleDeleteClientData = (clienteId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar permanentemente los datos de este cliente conforme a la Ley 1581 (Habeas Data)? Esta acción no se puede deshacer.'
    );
    if (confirmed) {
      storage.deleteCliente(clienteId);
      setSelectedCliente(null);
    }
  };

  const handleExportClientJson = (c: Cliente) => {
    exportClienteDataJson(c, clientQuotes, clientCitas);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export button */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4F9DA6]" />
            <span>Gestión de Clientes (CRM)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total {clientes.length} clientes registrados en Bogotá
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#4F9DA6]" />
            <span>Exportar Clientes (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, barrio o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:border-[#78BDC4]"
            >
              <option value="todos">Estado: Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="cotizado">Cotizado</option>
              <option value="agendado">Agendado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Barrio Filter */}
          <div className="sm:col-span-2">
            <select
              value={barrioFilter}
              onChange={(e) => setBarrioFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:border-[#78BDC4]"
            >
              <option value="todos">Barrio: Todos</option>
              {uniqueBarrios.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Origin Filter */}
          <div className="sm:col-span-2">
            <select
              value={origenFilter}
              onChange={(e) => setOrigenFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:border-[#78BDC4]"
            >
              <option value="todos">Origen: Todos</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Recomendación">Recomendación</option>
              <option value="Google">Google</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clientes Table & Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Contacto & Ubicación</th>
                <th className="px-5 py-4">Origen</th>
                <th className="px-5 py-4">Etiquetas</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((c) => {
                  const statusColors: Record<EstadoCliente, string> = {
                    nuevo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    cotizado: 'bg-amber-100 text-amber-800 border-amber-200',
                    agendado: 'bg-blue-100 text-blue-800 border-blue-200',
                    realizado: 'bg-teal-100 text-teal-800 border-teal-200',
                    cancelado: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCliente(c)}
                      className="hover:bg-[#EBF7F8]/40 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#78BDC4] to-[#4F9DA6] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {c.nombre.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm group-hover:text-[#2F6F77]">
                              {c.nombre}
                            </div>
                            <div className="text-[11px] text-slate-400">{c.correo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-700">{c.telefono}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#4F9DA6]" />
                          <span>
                            {c.barrio}, {c.ciudad}
                          </span>
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-600 text-[11px]">
                          {c.origen}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.etiquetas.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#EBF7F8] text-[#2F6F77] text-[10px] font-bold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            statusColors[c.estado]
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="px-5 py-4 text-right">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1"
                        >
                          <button
                            onClick={() =>
                              openWhatsAppChat(
                                c.telefono,
                                `¡Hola ${c.nombre}! Te saluda Omaira de Tapiz Fresh.`
                              )
                            }
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenGoogleMaps(c)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Abrir en Google Maps"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCliente(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLIENT DETAIL DRAWER / MODAL */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#78BDC4] to-[#4F9DA6] text-white flex items-center justify-center font-bold text-lg uppercase">
                  {selectedCliente.nombre.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{selectedCliente.nombre}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{selectedCliente.barrio}, {selectedCliente.ciudad}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF7F8] text-[#2F6F77]">
                      {selectedCliente.origen}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCliente(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    openWhatsAppChat(
                      selectedCliente.telefono,
                      `¡Hola ${selectedCliente.nombre}! Te saluda Omaira de Tapiz Fresh.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={`tel:${selectedCliente.telefono.replace(/\D/g, '')}`}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar</span>
                </a>

                <button
                  onClick={() => handleOpenGoogleMaps(selectedCliente)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir en Google Maps</span>
                </button>
              </div>

              {/* Status Switcher */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Estado en el CRM
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {(['nuevo', 'cotizado', 'agendado', 'realizado', 'cancelado'] as EstadoCliente[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleChangeStatus(st)}
                        className={`py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                          selectedCliente.estado === st
                            ? 'bg-[#78BDC4] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Full Personal Information */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ficha de Contacto y Dirección
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Teléfono / WhatsApp:</span>
                    <span className="font-bold text-slate-800">{selectedCliente.telefono}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Correo Electrónico:</span>
                    <span className="font-bold text-slate-800">{selectedCliente.correo}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Dirección de Domicilio:</span>
                    <span className="font-bold text-slate-800">
                      {selectedCliente.direccion} ({selectedCliente.barrio}, {selectedCliente.ciudad})
                    </span>
                  </div>
                </div>

                {selectedCliente.notas && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block">Notas del Cliente:</span>
                    <p className="text-xs text-slate-600 mt-1">{selectedCliente.notas}</p>
                  </div>
                )}
              </div>

              {/* Tags Management */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Etiquetas Personalizadas</span>
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedCliente.etiquetas.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBF7F8] text-[#2F6F77] text-xs font-bold"
                    >
                      <span>{t}</span>
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar etiqueta (ej. Mascotas, VIP, Mancha café)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Bitácora de Seguimientos */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Seguimiento y Registro de Contactos
                </h4>

                <form onSubmit={handleAddFollowup} className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={newFollowupType}
                      onChange={(e) => setNewFollowupType(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="llamada">Llamada</option>
                      <option value="correo">Correo</option>
                      <option value="visita">Visita</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Escribe el resultado del contacto o nota interna..."
                      value={newFollowupNote}
                      onChange={(e) => setNewFollowupNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#78BDC4]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-bold text-xs cursor-pointer"
                    >
                      Anotar
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  {clientFollowups.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No hay seguimientos registrados aún.</p>
                  ) : (
                    clientFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">[{f.tipo}]</span>
                          <span>{new Date(f.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{f.nota}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* History of Quotes */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Historial de Cotizaciones ({clientQuotes.length})
                </h4>
                {clientQuotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay cotizaciones para este cliente.</p>
                ) : (
                  clientQuotes.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Valor: ${q.valor_cotizado.toLocaleString('es-CO')}</span>
                        <span className="capitalize text-teal-700">{q.estado}</span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        {q.items.map((i) => `${i.cantidad}x ${i.mueble}`).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* History of Appointments */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Historial de Citas y Visitas ({clientCitas.length})
                </h4>
                {clientCitas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay citas agendadas aún.</p>
                ) : (
                  clientCitas.map((cit) => (
                    <div key={cit.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{cit.titulo}</span>
                        <span className="capitalize text-blue-700">{cit.estado}</span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        📅 {new Date(cit.fecha_inicio).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      <div className="text-slate-700 font-semibold mt-0.5">
                        Valor: ${cit.valor.toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Acciones del Cliente
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleExportClientJson(selectedCliente)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4F9DA6]" />
                    <span>Descargar Ficha (JSON)</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClientData(selectedCliente.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar Cliente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
