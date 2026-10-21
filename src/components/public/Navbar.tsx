import React from 'react';
import { Sparkles, Phone, MessageSquare, UserCog } from 'lucide-react';
import { buildWhatsAppLink, TAPIZ_FRESH_PHONE, TAPIZ_FRESH_PHONE_FORMATTED } from '../../services/whatsapp';

interface NavbarProps {
  onGoToAdmin: () => void;
  onGoToQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGoToAdmin, onGoToQuote }) => {
  const waUrl = buildWhatsAppLink(
    TAPIZ_FRESH_PHONE,
    '¡Hola Omaira! Quiero cotizar el lavado de mis muebles con Tapiz Fresh en Bogotá. Te adjunto una foto.'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner - Clean, honest, Bogotá only */}
      <div className="bg-[#78BDC4] text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Servicio a domicilio en Bogotá • Envíanos una foto de tu mueble al WhatsApp: {TAPIZ_FRESH_PHONE_FORMATTED}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#78BDC4] to-[#4F9DA6] flex items-center justify-center shadow-md shadow-[#78BDC4]/30 text-white relative overflow-hidden">
            <span className="text-2xl font-black tracking-tighter">TF</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                Tapiz<span className="text-[#4F9DA6]">Fresh</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7F8] text-[#2F6F77] border border-[#78BDC4]/40">
                BOGOTÁ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Lavado de Muebles y Colchones a Domicilio</p>
          </div>
        </div>

        {/* Desktop Quick Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#como-funciona" className="hover:text-[#4F9DA6] transition-colors">Antes y Después</a>
          <a href="#servicios" className="hover:text-[#4F9DA6] transition-colors">Servicios</a>
          <a href="#cotizador" className="hover:text-[#4F9DA6] transition-colors">Pedir Cotización con Foto</a>
          <a href="#testimonios" className="hover:text-[#4F9DA6] transition-colors">Clientes</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={`tel:${TAPIZ_FRESH_PHONE}`}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#4F9DA6]" />
            <span>{TAPIZ_FRESH_PHONE_FORMATTED}</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={onGoToQuote}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#78BDC4]/25 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir Cotización</span>
          </button>

          <button
            onClick={onGoToAdmin}
            title="Panel de Administración"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <UserCog className="w-4 h-4 text-[#4F9DA6]" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
