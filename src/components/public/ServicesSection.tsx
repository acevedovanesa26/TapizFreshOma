import React from 'react';
import { Sparkles, Droplets, Home, CheckCircle2 } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      id: 'srv-1',
      title: 'Lavado de Sofás y Seccionales',
      desc: 'Limpieza profunda a domicilio en Bogotá para sofás de 2, 3 puestos y muebles en L. Retiro de manchas y suciedad acumulada en la tela.',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-[#4F9DA6]">
          <rect x="8" y="24" width="48" height="24" rx="8" fill="#EBF7F8" stroke="#78BDC4" strokeWidth="2.5" />
          <path d="M12 24V16C12 13.7909 13.7909 12 16 12H48C50.2091 12 52 13.7909 52 16V24" stroke="#4F9DA6" strokeWidth="2.5" />
          <path d="M6 30H10V46H6C4.89543 46 4 45.1046 4 44V32C4 30.8954 4.89543 30 6 30Z" fill="#78BDC4" />
          <path d="M58 30H54V46H58C59.1046 46 60 45.1046 60 44V32C60 30.8954 59.1046 30 58 30Z" fill="#78BDC4" />
          <line x1="14" y1="48" x2="14" y2="54" stroke="#2F6F77" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="48" x2="50" y2="54" stroke="#2F6F77" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'srv-2',
      title: 'Lavado de Colchones',
      desc: 'Lavado a domicilio de colchones sencillos, semidobles, dobles, queen y king size. Cuidado textil para un descanso más higiénico.',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-[#4F9DA6]">
          <rect x="10" y="20" width="44" height="28" rx="6" fill="#EBF7F8" stroke="#78BDC4" strokeWidth="2.5" />
          <path d="M10 28H54" stroke="#78BDC4" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M16 16C16 13.7909 17.7909 12 20 12H44C46.2091 12 48 13.7909 48 16V20H16V16Z" fill="#78BDC4" opacity="0.3" stroke="#4F9DA6" strokeWidth="2" />
          <circle cx="24" cy="38" r="2.5" fill="#4F9DA6" />
          <circle cx="40" cy="38" r="2.5" fill="#4F9DA6" />
        </svg>
      ),
    },
    {
      id: 'srv-3',
      title: 'Sillas de Comedor y Poltronas',
      desc: 'Limpieza de tapicería en tela o terciopelo para juegos de comedor de 4, 6 u 8 puestos, sillas de oficina y butacas.',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-[#4F9DA6]">
          <rect x="18" y="32" width="28" height="10" rx="3" fill="#EBF7F8" stroke="#78BDC4" strokeWidth="2.5" />
          <path d="M22 32V14C22 12.8954 22.8954 12 24 12H40C41.1046 12 42 12.8954 42 14V32" stroke="#4F9DA6" strokeWidth="2.5" />
          <line x1="20" y1="42" x2="18" y2="54" stroke="#2F6F77" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="42" x2="46" y2="54" stroke="#2F6F77" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'srv-4',
      title: 'Cojines y Complementos de Sala',
      desc: 'Desmanchado y lavado de cojinería suelta, espaldres y piezas de tapicería complementaria para renovar tu sala.',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-[#4F9DA6]">
          <rect x="14" y="14" width="36" height="36" rx="8" fill="#EBF7F8" stroke="#78BDC4" strokeWidth="2.5" transform="rotate(6 32 32)" />
          <circle cx="32" cy="32" r="4" fill="#4F9DA6" />
        </svg>
      ),
    },
  ];

  return (
    <section id="servicios" className="py-14 sm:py-20 bg-slate-50/70 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF7F8] border border-[#78BDC4]/40 text-[#2F6F77] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#4F9DA6]" />
            Nuestros Servicios a Domicilio en Bogotá
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Especialistas en Limpieza de Tapicería
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Llegamos directamente a tu domicilio en Bogotá con máquinas especializadas de inyección y extracción para dejar tus muebles limpios y renovados.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 hover:border-[#78BDC4] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#EBF7F8] flex items-center justify-center mb-4">
                  {srv.icon}
                </div>
                <h3 className="text-base font-extrabold text-slate-800 leading-snug">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-[#4F9DA6]">
                  Cotización personalizada por foto →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Simple Process Steps (Honest) */}
        <div className="mt-14 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <h3 className="text-xl font-black text-slate-800 text-center mb-8">
            ¿Cómo Realizamos el Lavado en tu Casa?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F8] text-[#2F6F77] font-black text-base mx-auto flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Inspección de la Tela</h4>
              <p className="text-xs text-slate-500 mt-1">Revisamos el tipo de tejido y las zonas con manchas más marcadas.</p>
            </div>

            <div className="text-center p-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F8] text-[#2F6F77] font-black text-base mx-auto flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Aspirado Inicial</h4>
              <p className="text-xs text-slate-500 mt-1">Retiramos el polvo acumulado y residuos sueltos en seco.</p>
            </div>

            <div className="text-center p-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F8] text-[#2F6F77] font-black text-base mx-auto flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Inyección y Succión</h4>
              <p className="text-xs text-slate-500 mt-1">Lavamos con líquido desmanchador y extraemos el agua sucia con máquina.</p>
            </div>

            <div className="text-center p-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7F8] text-[#2F6F77] font-black text-base mx-auto flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Acabado y Aroma</h4>
              <p className="text-xs text-slate-500 mt-1">Dejamos la tela fresca, limpia y con suave aroma para ventilar en casa.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
