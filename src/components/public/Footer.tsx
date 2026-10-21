import React from 'react';
import { Phone, MessageSquare, Lock, MapPin, Heart } from 'lucide-react';
import { TAPIZ_FRESH_PHONE, TAPIZ_FRESH_PHONE_FORMATTED } from '../../services/whatsapp';

interface FooterProps {
  onGoToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoToAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#78BDC4] flex items-center justify-center text-white font-black text-xl shadow-md">
                TF
              </div>
              <span className="text-xl font-extrabold text-white">
                Tapiz<span className="text-[#78BDC4]">Fresh</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Servicio profesional de lavado de sofás, colchones y sillas de comedor a domicilio en Bogotá. Cuidado dedicado encabezado por Omaira Motato.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contacto Directo</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#78BDC4]" />
                <span>Teléfono / WhatsApp: <strong className="text-white">{TAPIZ_FRESH_PHONE_FORMATTED}</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#78BDC4]" />
                <span>Cobertura: Bogotá D.C. (Todos los barrios)</span>
              </li>
              <li>
                <span>Correo: tapizoma2026@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acceso Administrativo</h4>
            <p className="text-xs text-slate-400">
              Panel privado para gestión de solicitudes entrantes, clientes y agenda de visitas.
            </p>
            <div className="pt-1">
              <button
                onClick={onGoToAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#78BDC4]" />
                <span>Panel de Administración (/admin)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Tapiz Fresh - Lavado de Muebles a Domicilio en Bogotá.</p>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para hogares limpios en Bogotá</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
