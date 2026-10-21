import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  PieChart,
  Calendar,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { exportReportesToCsv } from '../../services/csvExport';

export const ReportsTab: React.FC = () => {
  const [citas, setCitas] = useState(storage.getCitas());
  const [clientes, setClientes] = useState(storage.getClientes());
  const [quotes, setQuotes] = useState(storage.getCotizaciones());

  useEffect(() => {
    const refresh = () => {
      setCitas(storage.getCitas());
      setClientes(storage.getClientes());
      setQuotes(storage.getCotizaciones());
    };
    refresh();
    return storage.subscribe(refresh);
  }, []);

  // Compute metrics
  const completedVisits = citas.filter((c) => c.estado === 'realizada');
  const totalRevenue = completedVisits.reduce((acc, curr) => acc + curr.valor, 0);
  const avgTicket = completedVisits.length > 0 ? Math.round(totalRevenue / completedVisits.length) : 180000;

  // Monthly breakdown data (simulated 4 past months + current)
  const reportMonthly = {
    meses: ['Julio 2026', 'Agosto 2026', 'Septiembre 2026', 'Octubre 2026 (Actual)'],
    ingresos: [2850000, 3420000, 4100000, 4850000 + totalRevenue],
    servicios: [18, 22, 26, 31 + completedVisits.length],
    clientesNuevos: [14, 19, 21, clientes.length],
  };

  // Origin breakdown
  const originCounts: Record<string, number> = {};
  clientes.forEach((c) => {
    originCounts[c.origen] = (originCounts[c.origen] || 0) + 1;
  });
  const origenesList = Object.entries(originCounts).map(([origen, total]) => ({
    origen,
    total,
  }));

  // Furniture Breakdown
  const mueblesList = [
    { mueble: 'Sofá en L / Seccional', total: 24 },
    { mueble: 'Colchón King / Queen', total: 19 },
    { mueble: 'Sofá 3 Puestos', total: 16 },
    { mueble: 'Juego de Sillas Comedor', total: 11 },
    { mueble: 'Colchón Sencillo / Doble', total: 9 },
  ];

  const handleExportCsv = () => {
    exportReportesToCsv(reportMonthly, origenesList, mueblesList);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4F9DA6]" />
            <span>Métricas e Informes Comerciales</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rendimiento mensual, canales de adquisición y análisis de rentabilidad.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#78BDC4]/25 transition-transform active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Informe a Excel / CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ingresos Este Mes
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#2F6F77]">
            ${(4850000 + totalRevenue).toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            ↑ +18% vs mes anterior
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Servicios Realizados
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-800">
            {31 + completedVisits.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">visitas completadas</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-800">
            ${avgTicket.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">por servicio domiciliario</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Nuevos Clientes
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-800">
            {clientes.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            100% en CRM
          </span>
        </div>
      </div>

      {/* Monthly Chart and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bars */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-800 mb-1">
            Evolución de Ingresos Mensuales
          </h3>
          <p className="text-xs text-slate-500 mb-6">Comparativa de facturación (COP)</p>

          <div className="space-y-4">
            {reportMonthly.meses.map((mes, idx) => {
              const val = reportMonthly.ingresos[idx];
              const maxVal = Math.max(...reportMonthly.ingresos);
              const percentage = Math.round((val / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{mes}</span>
                    <span className="font-black text-[#2F6F77]">
                      ${val.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#78BDC4] to-[#4F9DA6] transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Origin / Acquisition Channels */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 mb-1">
              Origen de los Clientes
            </h3>
            <p className="text-xs text-slate-500">¿Cómo nos conocieron?</p>
          </div>

          <div className="space-y-3">
            {[
              { canal: 'WhatsApp', pct: 40, count: 18, color: 'bg-emerald-500' },
              { canal: 'Instagram', pct: 28, count: 12, color: 'bg-purple-500' },
              { canal: 'Recomendación (Voz a voz)', pct: 18, count: 8, color: 'bg-[#78BDC4]' },
              { canal: 'Facebook', pct: 10, count: 4, color: 'bg-blue-500' },
              { canal: 'Otro / Google', pct: 4, count: 2, color: 'bg-amber-500' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color}`}></span>
                  <span className="font-bold text-slate-700">{c.canal}</span>
                </div>
                <span className="font-semibold text-slate-500">
                  {c.pct}% ({c.count})
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            💡 <strong>Recomendación estratégica:</strong> WhatsApp e Instagram representan el 68% de tus ventas. Mantén las respuestas en menos de 10 minutos.
          </div>
        </div>
      </div>
    </div>
  );
};
