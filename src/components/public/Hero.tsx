import React from 'react';
import { Sparkles, Camera, MapPin, MessageSquare, ArrowRight, Home } from 'lucide-react';
import { buildWhatsAppLink, TAPIZ_FRESH_PHONE, TAPIZ_FRESH_PHONE_FORMATTED } from '../../services/whatsapp';
import { storage } from '../../services/storage';

interface HeroProps {
  onCotizarClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCotizarClick }) => {
  const [config, setConfig] = React.useState(storage.getConfig());

  React.useEffect(() => {
    return storage.subscribe(() => {
      setConfig(storage.getConfig());
    });
  }, []);

  const heroImage =
    config.fotoHeroPrincipal ||
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80';

  const waUrl = buildWhatsAppLink(
    TAPIZ_FRESH_PHONE,
    '¡Hola Omaira! Quiero cotizar el lavado de mis muebles con Tapiz Fresh en Bogotá. Te adjunto una foto completa de mi mueble.'
  );

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#EBF7F8]/70 via-white to-white">
      {/* Decorative Bubbles Background */}
      <div className="absolute top-10 left-1/4 w-36 h-36 rounded-full bg-[#78BDC4]/20 blur-2xl pointer-events-none"></div>
      <div className="absolute top-36 right-8 w-52 h-52 rounded-full bg-[#4F9DA6]/15 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#78BDC4]/40 shadow-xs text-xs font-bold text-[#2F6F77]">
              <MapPin className="w-3.5 h-3.5 text-[#4F9DA6]" />
              <span>Servicio Exclusivo a Domicilio en Bogotá</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-[1.12]">
              Tus muebles y colchones limpios, <span className="text-[#4F9DA6]">directo en tu hogar</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Servicio profesional de lavado y desmanchado de sofás, colchones y sillas de comedor a domicilio en Bogotá. Envíanos una foto de tu mueble y te damos la cotización exacta sin compromiso.
            </p>

            {/* Honest Value Highlights (No fake marketing buzzwords) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-left">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs hover:border-[#78BDC4]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center mb-2">
                  <Home className="w-5 h-5 text-[#4F9DA6]" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">A Domicilio en Bogotá</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Vamos hasta tu casa en cualquier barrio de Bogotá.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs hover:border-[#78BDC4]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5 text-[#4F9DA6]" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">Cotización con Foto</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Envíanos una foto del mueble y te damos el valor exacto.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs hover:border-[#78BDC4]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-[#4F9DA6]" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">Atención Dedicada</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Tratamiento cuidadoso de cada tipo de tela.</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
              <button
                onClick={onCotizarClick}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-base shadow-lg shadow-[#78BDC4]/30 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Pedir Cotización con Foto</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-md shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp: {TAPIZ_FRESH_PHONE_FORMATTED}</span>
              </a>
            </div>
          </div>

          {/* Right Visual Column: Vector SVG Art + Real Work Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group relative">
                <img
                  src={heroImage}
                  alt="Lavado profesional de muebles Tapiz Fresh en Bogotá"
                  className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent"></div>

                {/* Overlaid Banner */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#78BDC4] text-white text-[11px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Omaira Motato • Tapiz Fresh</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight">
                    Lavado a fondo de sofás, colchones y comedores
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Atención en todos los barrios de Bogotá con maquinaria de extracción.
                  </p>
                </div>
              </div>

              {/* Floating Camera Tip Pill */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF7F8] text-[#2F6F77] flex items-center justify-center font-black">
                  <Camera className="w-6 h-6 text-[#4F9DA6]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">¡Cotiza en 2 minutos!</div>
                  <div className="text-[11px] text-slate-500">Solo tómale una foto a tu mueble</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
