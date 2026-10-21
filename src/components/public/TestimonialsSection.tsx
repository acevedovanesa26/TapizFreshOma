import React from 'react';
import { Star, MapPin } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Natalia Cárdenas',
      barrio: 'Cedritos (Bogotá)',
      mueble: 'Sofá Seccional y Sillas',
      comment:
        'Mi sofá blanco tenía manchas de café y acumulación de polvo. Omaira vino a mi casa y lo dejó impecable. Muy puntual y cuidadosa con el piso.',
      stars: 5,
    },
    {
      name: 'Santiago Arango',
      barrio: 'Colina Campestre (Bogotá)',
      mueble: 'Colchón King Size',
      comment:
        'Le envié la foto por WhatsApp y en 5 minutos me dio la cotización. El servicio fue rápido y la atención excelente. Muy recomendada.',
      stars: 5,
    },
    {
      name: 'Claudia Valenzuela',
      barrio: 'Pasadena (Bogotá)',
      mueble: 'Sofá 3 Puestos y Cojines',
      comment:
        'Excelente trabajo. Me gustó mucho que todo fue claro desde el principio con la foto que envié. Los muebles quedaron oliendo a limpio.',
      stars: 5,
    },
  ];

  return (
    <section id="testimonios" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#4F9DA6] uppercase tracking-wider bg-[#EBF7F8] px-3.5 py-1 rounded-full border border-[#78BDC4]/40">
            Clientes en Bogotá
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-3">
            Hogares que Confían en Tapiz Fresh
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Opiniones de personas que ya solicitaron su lavado a domicilio en Bogotá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t.name}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#4F9DA6]" />
                    <span>{t.barrio}</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#2F6F77] bg-[#EBF7F8] px-2.5 py-1 rounded-lg">
                  {t.mueble}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
