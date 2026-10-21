import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { TareaHoy, Cotizacion, Cita, Cliente } from '../../types';
import { openWhatsAppChat } from '../../services/whatsapp';

interface DashboardTabProps {
  onNavigate: (tab: 'solicitudes' | 'clientes' | 'embudo' | 'agenda') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tasks, setTasks] = useState<TareaHoy[]>([]);

  useEffect(() => {
    const refresh = () => {
      setQuotes(storage.getCotizaciones());
      setCitas(storage.getCitas());
      setClientes(storage.getClientes());
      setTasks(storage.getTasks());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  // Compute metrics
  const newRequestsCount = quotes.filter((q) => q.es_nuevo).length;
  const pendingQuotesCount = quotes.filter((q) => q.estado === 'pendiente').length;

  const todayStr = new Date().toISOString().substring(0, 10);
  const citasHoy = citas.filter(
    (c) => c.fecha_inicio.substring(0, 10) === todayStr && c.estado !== 'cancelada'
  );

  // Citas this week
  const oneWeekAhead = new Date();
  oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
  const oneWeekStr = oneWeekAhead.toISOString().substring(0, 10);
  const citasSemana = citas.filter(
    (c) =>
      c.fecha_inicio.substring(0, 10) >= todayStr &&
      c.fecha_inicio.substring(0, 10) <= oneWeekStr &&
      c.estado !== 'cancelada'
  );

  const completedServices = citas.filter((c) => c.estado === 'realizada').length;
  const totalRevenue = citas
    .filter((c) => c.estado === 'realizada')
    .reduce((sum, c) => sum + c.valor, 0);

  const handleToggleTask = (id: string) => {
    storage.toggleTask(id);
  };

  const handleOpenClientWhatsApp = (cliId?: string, taskTitle?: string) => {
    if (!cliId) {
      openWhatsAppChat('3124567890', '¡Hola! Te escribo de Tapiz Fresh.');
      return;
    }
    const cli = storage.getClienteById(cliId);
    if (cli) {
      const msg = `¡Hola ${cli.nombre}! Te saluda Omaira de Tapiz Fresh. Te escribo respecto a: ${taskTitle || 'tu servicio de limpieza'}.`;
      openWhatsAppChat(cli.telefono, msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#78BDC4] via-[#4F9DA6] to-[#2F6F77] text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 rounded-l-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Panel de Operaciones Tapiz Fresh
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            ¡Hola, Omaira! Aquí está tu resumen de hoy
          </h2>
          <p className="text-xs sm:text-sm text-teal-50 mt-1.5 leading-relaxed">
            Tienes <strong className="text-white underline">{newRequestsCount} solicitudes nuevas</strong> y{' '}
            <strong className="text-white underline">{citasHoy.length} visitas programadas</strong> para hoy en tu agenda a domicilio.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={() => onNavigate('solicitudes')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Solicitudes Nuevas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#2F6F77] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{newRequestsCount}</span>
            {newRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 animate-pulse">
                Sin responder
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ver solicitudes en tiempo real →</span>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigate('embudo')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cotizaciones Activas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{pendingQuotesCount}</span>
            <span className="text-xs text-slate-400">pendientes</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ver en embudo Kanban →</span>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('agenda')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Citas de Hoy / Semana
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{citasHoy.length}</span>
            <span className="text-xs text-slate-500 font-semibold">hoy ({citasSemana.length} esta sem.)</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Abrir agenda con mapas →</span>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigate('clientes')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#78BDC4] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clientes Registrados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{clientes.length}</span>
            <span className="text-xs text-slate-500 font-semibold">totales</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Base de datos de clientes →</span>
        </div>
      </div>

      {/* Main Row: "Qué hacer hoy" + Weekly Graph & Furniture Types */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Checklist "Qué hacer hoy" */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Qué Hacer Hoy</h3>
                <p className="text-xs text-slate-500">Pendientes prioritarios para Omaira</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2F6F77] bg-[#EBF7F8] px-2.5 py-1 rounded-full">
              {tasks.filter((t) => t.completada).length} / {tasks.length} listas
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  task.completada
                    ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                    : 'bg-white border-slate-200/80 hover:border-[#78BDC4]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completada}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded text-[#4F9DA6] focus:ring-[#78BDC4] cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{task.titulo}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.detalle}</p>
                    {task.hora && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#4F9DA6] bg-[#EBF7F8] px-2 py-0.5 rounded-md">
                        ⏰ {task.hora}
                      </span>
                    )}
                  </div>
                </div>

                {task.cliente_id && (
                  <button
                    onClick={() => handleOpenClientWhatsApp(task.cliente_id, task.titulo)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors shrink-0 cursor-pointer"
                    title="Escribir por WhatsApp al cliente"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Solicitudes por semana & Muebles más solicitados */}
        <div className="lg:col-span-6 space-y-6">
          {/* Furniture Type Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-800 mb-1">
              Tipos de Mueble Más Solicitados
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Demanda de servicios de limpieza del mes
            </p>

            <div className="space-y-3.5">
              {[
                { name: 'Sofás en L / Seccionales', percent: 45, count: 18, color: '#78BDC4' },
                { name: 'Colchones Doble y King', percent: 30, count: 12, color: '#4F9DA6' },
                { name: 'Sofás 2 y 3 Puestos', percent: 18, count: 7, color: '#38BDF8' },
                { name: 'Juegos de Sillas Comedor', percent: 7, count: 3, color: '#F59E0B' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-500">
                      {item.count} servicios ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitudes por semana Bar chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Solicitudes por Semana</h3>
                <p className="text-xs text-slate-500">Últimas 4 semanas</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +24% crecimiento
              </span>
            </div>

            <div className="h-32 flex items-end justify-between gap-4 pt-6 pb-2 px-2">
              {[
                { label: 'Sem 1', value: 8, height: '40%' },
                { label: 'Sem 2', value: 12, height: '60%' },
                { label: 'Sem 3', value: 15, height: '75%' },
                { label: 'Sem 4 (Actual)', value: 20, height: '95%' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[11px] font-bold text-slate-700">{bar.value}</span>
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#4F9DA6] to-[#78BDC4] transition-all hover:opacity-90"
                    style={{ height: bar.height }}
                  ></div>
                  <span className="text-[10px] text-slate-400 font-medium truncate">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
