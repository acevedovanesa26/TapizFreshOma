import React, { useState, useEffect } from 'react';
import {
  Kanban,
  DollarSign,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Cliente, EstadoCliente } from '../../types';
import { openWhatsAppChat } from '../../services/whatsapp';

interface KanbanColumn {
  id: EstadoCliente;
  title: string;
  color: string;
  badgeBg: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'nuevo', title: 'Nuevo', color: '#10B981', badgeBg: 'bg-emerald-100 text-emerald-800' },
  { id: 'cotizado', title: 'Cotizado', color: '#F59E0B', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'agendado', title: 'Agendado', color: '#3B82F6', badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'realizado', title: 'Realizado', color: '#78BDC4', badgeBg: 'bg-teal-100 text-teal-800' },
  { id: 'cancelado', title: 'Cancelado', color: '#94A3B8', badgeBg: 'bg-slate-200 text-slate-700' },
];

export const KanbanPipelineTab: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setClientes(storage.getClientes());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedClientId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: EstadoCliente) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (!id) return;

    const cliente = storage.getClienteById(id);
    if (cliente && cliente.estado !== targetColumn) {
      cliente.estado = targetColumn;
      storage.saveCliente(cliente);

      // Add a follow-up
      storage.addSeguimiento({
        cliente_id: cliente.id,
        tipo: 'visita',
        nota: `Etapa del embudo actualizada a: "${targetColumn}"`,
        creado_por: 'Omaira Motato',
      });
    }
    setDraggedClientId(null);
  };

  const moveStage = (cliente: Cliente, direction: 'prev' | 'next') => {
    const currentIdx = COLUMNS.findIndex((c) => c.id === cliente.estado);
    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < COLUMNS.length) {
      const target = COLUMNS[nextIdx].id;
      cliente.estado = target;
      storage.saveCliente(cliente);
      storage.addSeguimiento({
        cliente_id: cliente.id,
        tipo: 'visita',
        nota: `Etapa movida a: "${target}"`,
        creado_por: 'Omaira Motato',
      });
    }
  };

  // Map quotes to clients to show quote value
  const quotes = storage.getCotizaciones();
  const getClientQuoteValue = (clienteId: string) => {
    const q = quotes.find((quote) => quote.cliente_id === clienteId);
    return q ? q.valor_cotizado : 160000;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#4F9DA6]" />
            <span>Embudo de Ventas (Pipeline Kanban)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Arrastra y suelta las tarjetas de clientes para moverlos entre etapas del embudo comercial.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          💡 En celular: usa las flechas (← / →) en cada tarjeta
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colClients = clientes.filter((c) => c.estado === col.id);
          const colTotalValue = colClients.reduce(
            (sum, c) => sum + getClientQuoteValue(c.id),
            0
          );

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-100/70 rounded-3xl p-3 sm:p-4 border border-slate-200/60 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    ></span>
                    <h3 className="font-extrabold text-sm text-slate-800">{col.title}</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                    ${colTotalValue.toLocaleString('es-CO')} COP
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${col.badgeBg}`}>
                  {colClients.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colClients.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-[11px] text-slate-400 font-medium">
                    Arrastra aquí
                  </div>
                ) : (
                  colClients.map((c) => {
                    const quoteVal = getClientQuoteValue(c.id);
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, c.id)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                            {c.nombre}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {c.origen}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#4F9DA6] shrink-0" />
                          <span className="truncate">{c.barrio}</span>
                        </div>

                        <div className="text-xs font-black text-[#2F6F77] pt-1">
                          ${quoteVal.toLocaleString('es-CO')} COP
                        </div>

                        {c.etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {c.etiquetas.slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom Actions on Card */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() =>
                              openWhatsAppChat(
                                c.telefono,
                                `¡Hola ${c.nombre}! Te saluda Omaira de Tapiz Fresh.`
                              )
                            }
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Stage Mover for Mobile */}
                          <div className="flex items-center gap-1">
                            {col.id !== 'nuevo' && (
                              <button
                                onClick={() => moveStage(c, 'prev')}
                                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                title="Mover a etapa anterior"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== 'cancelado' && (
                              <button
                                onClick={() => moveStage(c, 'next')}
                                className="p-1 rounded-md bg-[#EBF7F8] hover:bg-[#78BDC4] text-[#2F6F77] hover:text-white cursor-pointer"
                                title="Mover a siguiente etapa"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
